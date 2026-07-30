const { createClient, DEFAULT_INTEGRATION_VERSION } = require("../dist/sdk.js");

// Mirrors what `1Password/load-secrets-action@v5beta` does on a runner:
// authenticate as a workload using an OIDC token minted by GitHub, then read an
// Environment's variables. Names match the action's inputs so the test and the
// action stay configured the same way.
//
// Only runs on a GitHub Actions runner in a job that requests `id-token: write`
// and has the workload configuration available. Everywhere else — local runs,
// jobs without the permission, forks — it skips instead of failing.
const OIDC_TOKEN_URL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const OIDC_TOKEN_REQUEST_TOKEN = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
const WORKLOAD_ID = process.env.OP_WORKLOAD_ID;
const INTEGRATION_KEY = process.env.OP_INTEGRATION_KEY;
const ENVIRONMENT_ID = process.env.OP_ENVIRONMENT_ID;

const missing = [
  ["ACTIONS_ID_TOKEN_REQUEST_URL", OIDC_TOKEN_URL],
  ["ACTIONS_ID_TOKEN_REQUEST_TOKEN", OIDC_TOKEN_REQUEST_TOKEN],
  ["OP_WORKLOAD_ID", WORKLOAD_ID],
  ["OP_INTEGRATION_KEY", INTEGRATION_KEY],
  ["OP_ENVIRONMENT_ID", ENVIRONMENT_ID],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.log(
    `Skipping workload identity tests, missing: ${missing.join(", ")}`,
  );
}

const testWorkloadIdentity = missing.length > 0 ? test.skip : test;

// Requests an OIDC token from the GitHub Actions runner. This is the exchange
// the action performs on the SDK's behalf; the SDK only ever calls back into a
// fetcher like this one, so it needs no knowledge of the CI provider.
const githubOidcFetcher = async (audience) => {
  const url = `${OIDC_TOKEN_URL}&audience=${encodeURIComponent(audience)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${OIDC_TOKEN_REQUEST_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error(
      `failed to fetch GitHub OIDC token: ${response.status} ${await response.text()}`,
    );
  }

  const { value } = await response.json();
  if (!value) {
    throw new Error("GitHub OIDC token response contained no token");
  }
  return value;
};

// Checked separately from client creation so a failure here points at the
// runner's OIDC setup rather than at the broker rejecting the token.
testWorkloadIdentity("the runner mints an OIDC token", async () => {
  const token = await githubOidcFetcher("test-audience");

  expect(typeof token).toBe("string");
  // ID tokens are JWTs: header.payload.signature.
  expect(token.split(".")).toHaveLength(3);
});

testWorkloadIdentity(
  "a workload identity client reads environment variables",
  async () => {
    const audiences = [];
    const client = await createClient({
      oidcFetcher: async (audience) => {
        audiences.push(audience);
        return githubOidcFetcher(audience);
      },
      workloadDetails: {
        workloadUuid: WORKLOAD_ID,
        customerManagedSecret: INTEGRATION_KEY,
      },
      integrationName: "Integration_Test_JS",
      integrationVersion: DEFAULT_INTEGRATION_VERSION,
    });

    // Proves the core drove the callback rather than authenticating some other
    // way, so a regression that bypasses the fetcher can't pass silently.
    expect(audiences.length).toBeGreaterThan(0);

    // Getting variables back at all is the proof: the broker has to authenticate
    // the workload before it will return them.
    const environment = await client.environments.getVariables(ENVIRONMENT_ID);
    expect(environment.variables.length).toBeGreaterThan(0);
    for (const variable of environment.variables) {
      expect(typeof variable.name).toBe("string");
      expect(variable.name.length).toBeGreaterThan(0);
    }
  },
  30000,
);
