const { createClient, DEFAULT_INTEGRATION_VERSION } = require("../dist/sdk.js");

const OIDC_TOKEN_URL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const OIDC_TOKEN_REQUEST_TOKEN = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
const WORKLOAD_ID = process.env.OP_WORKLOAD_ID;
const INTEGRATION_KEY = process.env.OP_INTEGRATION_KEY;
const ENVIRONMENT_ID = process.env.OP_ENVIRONMENT_ID;

// Workaround for an SDK bug: this is temporary fix and can be removed once the SDK is updated to a version that includes the fix.
const unpad = (secret) => secret.replace(/=+$/, "");

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

testWorkloadIdentity("the runner mints an OIDC token", async () => {
  const token = await githubOidcFetcher("test-audience");

  // Compared as a count, not with `toHaveLength` on the split array, so a
  // failure prints two numbers instead of the token itself. GitHub masks
  // registered secrets in logs, but this token is minted at runtime and is not
  // covered by that.
  expect(typeof token).toBe("string");
  expect(token.split(".").length).toBe(3);
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
        customerManagedSecret: unpad(INTEGRATION_KEY),
      },
      integrationName: "Integration_Test_JS",
      integrationVersion: DEFAULT_INTEGRATION_VERSION,
    });

    expect(audiences.length).toBeGreaterThan(0);

    const environment = await client.environments.getVariables(ENVIRONMENT_ID);

    // Names are safe to print, values are not.
    const names = environment.variables.map((variable) => variable.name);
    console.log(`Pulled ${names.length} variables: ${names.join(", ")}`);

    expect(environment.variables.length).toBeGreaterThan(1);

    const namesWithoutValues = environment.variables
      .filter((variable) => !variable.value)
      .map((variable) => variable.name);
    expect(namesWithoutValues).toEqual([]);
  },
  30000,
);
