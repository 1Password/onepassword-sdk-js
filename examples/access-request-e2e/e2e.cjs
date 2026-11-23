const sdk = require("@1password/sdk");

const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const { existsSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

/** @typedef {"happy" | "read-reference" | "deny-then-grant" | "two-requests" | "multi-entry" | "expire" | "errors"} E2EScenario */
/** @typedef {"local" | "installed"} OphLaunchMode */

const INSTALLED_OPH_MACOS_APP = "/Applications/1Password.app";
const INSTALLED_OPH_SENTINELS = new Set([
  "installed",
  "production",
  "prod",
  "system",
  "applications",
  "/applications",
  "/applications/1password.app",
]);

const E2E_SCENARIOS = {
  happy: "Full flow: create access request, approve in OPH, poll, read login",
  "read-reference":
    "Skip create/approve; read login from OP_E2E_CREDENTIAL_REFERENCE only",
  "deny-then-grant":
    "Create request A (deny in OPH), then request B (approve) and read",
  "two-requests":
    "Create two pending requests; approve in any order; both must resolve",
  "multi-entry":
    "One request with two login entries; approve both in OPH; verify entryId mapping",
  expire:
    "Create a request, do NOT act on it, poll until the broker reports expired (needs a short access-request TTL)",
  errors:
    "Negative cases built from your creds: checks each failure throws the expected typed error (InvalidRequestError, IntegrationKeyInvalidError, InvalidTokenError, AccessRequestNotFoundError, NoActiveGrantError, …)",
};

// ---------------------------------------------------------------------------
// Config: env vars with interactive fallback
// ---------------------------------------------------------------------------

async function promptLine(label, { secret = false, defaultValue } = {}) {
  const rl = readline.createInterface({ input, output });
  try {
    const suffix =
      defaultValue !== undefined && defaultValue !== ""
        ? ` [${defaultValue}]`
        : "";
    const answer = await rl.question(`${label}${suffix}: `);
    const trimmed = answer.trim();
    if (trimmed) {
      return trimmed;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return "";
  } finally {
    rl.close();
  }
}

async function requiredConfig(name, label, options = {}) {
  const fromEnv = process.env[name];
  if (fromEnv) {
    return fromEnv;
  }
  while (true) {
    const value = await promptLine(label, options);
    if (value) {
      return value;
    }
    console.error(`${label} is required (or set ${name}).`);
  }
}

async function loadE2EConfig() {
  const scenarioRaw =
    process.env.OP_E2E_SCENARIO ||
    (await promptLine(`Scenario (${Object.keys(E2E_SCENARIOS).join(", ")})`, {
      defaultValue: "happy",
    }));

  if (!Object.hasOwn(E2E_SCENARIOS, scenarioRaw)) {
    throw new Error(
      `Unknown OP_E2E_SCENARIO "${scenarioRaw}". Valid: ${Object.keys(
        E2E_SCENARIOS,
      ).join(", ")}`,
    );
  }

  /** @type {E2EScenario} */
  const scenario = scenarioRaw;

  console.log(`\n=== OAuth broker E2E: ${scenario} ===`);
  console.log(E2E_SCENARIOS[scenario]);
  console.log(
    "OAuth prep (integration key, tokens, client) should be done before this script.\n",
  );

  const integrationKey = await requiredConfig(
    "OP_OAUTH_INTEGRATION_KEY",
    "Integration key (ops_… from consent)",
  );
  const accessToken = await requiredConfig(
    "OP_OAUTH_ACCESS_TOKEN",
    "OAuth access token (op_o_u_…)",
    { secret: true },
  );

  /** @type {{ scenario: E2EScenario, integrationKey: string, accessToken: string, website?: string, website2?: string, credentialReference?: string, autoLaunchOph: boolean, ophLaunchMode?: OphLaunchMode, ophSourceDir?: string }} */
  const config = {
    scenario,
    integrationKey,
    accessToken,
    autoLaunchOph: process.env.OP_AUTO_LAUNCH_OPH !== "false",
    ophSourceDir: expandUserPath(process.env.OPH_SOURCE_DIR),
  };

  if (scenario === "errors") {
    return config;
  }

  if (scenario === "read-reference") {
    config.credentialReference = await requiredConfig(
      "OP_E2E_CREDENTIAL_REFERENCE",
      "Credential reference (accounts/…/configurations/…)",
    );
    return config;
  }

  config.website = await requiredConfig(
    "OP_E2E_WEBSITE",
    "Login website URL to match in OPH",
  );

  if (scenario === "multi-entry") {
    config.website2 = await requiredConfig(
      "OP_E2E_WEBSITE_2",
      "Second login website (different Login in vault)",
    );
  } else if (scenario === "two-requests") {
    config.website2 =
      process.env.OP_E2E_WEBSITE_2 ||
      (await promptLine("Second login website (defaults to first website)", {
        defaultValue: config.website,
      }));
  }

  // expire must never open OPH: any approve/deny would stop it from expiring.
  if (scenario === "expire") {
    config.autoLaunchOph = false;
  }

  if (config.autoLaunchOph) {
    await configureOphLaunch(config);
  }

  return config;
}

function expandUserPath(dir) {
  if (!dir) {
    return dir;
  }
  if (dir === "~") {
    return os.homedir();
  }
  if (dir.startsWith("~/")) {
    return path.join(os.homedir(), dir.slice(2));
  }
  return dir;
}

function isLocalOphCheckout(ophSourceDir) {
  return existsSync(path.join(ophSourceDir, "dist", "app", "main.js"));
}

function installedOphAvailable() {
  return (
    os.platform() === "darwin" &&
    existsSync(path.join(INSTALLED_OPH_MACOS_APP, "Contents/MacOS/1Password"))
  );
}

function normalizeOphSentinel(value) {
  return value.trim().toLowerCase().replace(/\/+$/, "");
}

function ophSourceDirMeansInstalled(ophSourceDir) {
  if (!ophSourceDir) {
    return false;
  }
  return INSTALLED_OPH_SENTINELS.has(normalizeOphSentinel(ophSourceDir));
}

function resolveOphLaunchMode(ophSourceDirFromEnv) {
  const launchRaw = process.env.OP_OPH_LAUNCH?.trim().toLowerCase();
  if (launchRaw === "local" || launchRaw === "electron") {
    return "local";
  }
  if (
    launchRaw === "installed" ||
    launchRaw === "production" ||
    launchRaw === "prod" ||
    launchRaw === "system"
  ) {
    return "installed";
  }

  if (ophSourceDirFromEnv && ophSourceDirMeansInstalled(ophSourceDirFromEnv)) {
    return "installed";
  }
  if (ophSourceDirFromEnv) {
    return "local";
  }

  // Default: installed 1Password on macOS; otherwise local dev OPH (requires OPH_SOURCE_DIR).
  if (installedOphAvailable()) {
    return "installed";
  }
  return "local";
}

async function configureOphLaunch(config) {
  /** @type {OphLaunchMode} */
  const mode = resolveOphLaunchMode(config.ophSourceDir);
  config.ophLaunchMode = mode;

  if (mode === "installed") {
    if (!installedOphAvailable()) {
      throw new Error(
        `OP_OPH_LAUNCH=installed but ${INSTALLED_OPH_MACOS_APP} was not found (macOS only).`,
      );
    }
    console.log(`Using installed 1Password at ${INSTALLED_OPH_MACOS_APP}`);
    return;
  }

  config.ophSourceDir = await resolveLocalOphSourceDir(config.ophSourceDir);
}

async function resolveLocalOphSourceDir(fromEnv) {
  const ophSourceDir =
    fromEnv && !ophSourceDirMeansInstalled(fromEnv)
      ? fromEnv
      : await requiredConfig(
          "OPH_SOURCE_DIR",
          "Path to local js/oph checkout (~ allowed; or set OP_OPH_LAUNCH=installed)",
        );

  const expanded = expandUserPath(ophSourceDir);
  if (!isLocalOphCheckout(expanded)) {
    throw new Error(
      `Local OPH build not found at ${expanded} (expected dist/app/main.js). Build js/oph first.`,
    );
  }
  console.log(`Using local OPH checkout at ${expanded}`);
  return expanded;
}

async function createBrokerOAuthClient(config) {
  return sdk.createOAuthClient({
    accessToken: config.accessToken,
    integrationKey: config.integrationKey,
  });
}

function loginEntryCreateParams(website, { label = "login" } = {}) {
  return {
    type: sdk.AccessRequestEntryType.Login,
    parameters: { website },
    reason: process.env.OP_E2E_REASON || `E2E ${label} credential access`,
    keywords: process.env.OP_E2E_KEYWORDS
      ? process.env.OP_E2E_KEYWORDS.split(",").map((k) => k.trim())
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Access request + OPH helpers
// ---------------------------------------------------------------------------

async function launchInstalledOph(appLink) {
  if (!installedOphAvailable()) {
    throw new Error(
      `Installed 1Password not found at ${INSTALLED_OPH_MACOS_APP}`,
    );
  }

  return new Promise((resolve, reject) => {
    const child = spawn("open", ["-a", "1Password", appLink], {
      stdio: "ignore",
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`open -a 1Password exited with code ${code}`));
    });
  });
}

async function launchLocalOph(appLink, ophSourceDir) {
  const entryPoint = path.join(ophSourceDir, "dist", "app", "main.js");
  const electronExecutable = path.join(
    ophSourceDir,
    "node_modules",
    ".bin",
    "electron",
  );

  if (!existsSync(entryPoint)) {
    throw new Error(
      `Local OPH entry point not found at ${entryPoint}; build OPH first`,
    );
  }
  if (!existsSync(electronExecutable)) {
    throw new Error(
      `Local Electron executable not found at ${electronExecutable}; install OPH dependencies first`,
    );
  }

  return new Promise((resolve, reject) => {
    // Same launch as `pnpm start <url>` in js/oph. Avoid macOS's registered
    // onepassword:// handler, which could open an installed app from /Applications.
    const electronEnvironment = { ...process.env };
    delete electronEnvironment.ELECTRON_RUN_AS_NODE;

    const child = spawn(electronExecutable, ["./dist/app/main.js", appLink], {
      cwd: ophSourceDir,
      detached: false,
      env: electronEnvironment,
      stdio: "ignore",
    });

    child.once("error", reject);
    child.once("spawn", () => resolve(child));
  });
}

function releaseOphProcess(ophProcess) {
  if (process.env.OP_KILL_OPH_ON_EXIT !== "true") {
    return;
  }
  if (ophProcess?.exitCode === null && ophProcess?.signalCode === null) {
    ophProcess.kill();
  }
}

async function maybeOpenOph(config, appLink, { label } = {}) {
  console.log(`\n--- ${label} ---`);
  console.log(appLink);

  if (!config.autoLaunchOph) {
    console.log(
      "OP_AUTO_LAUNCH_OPH=false — open the link manually:",
      "local: cd js/oph && pnpm start '<app link>'",
      "installed: open -a 1Password '<app link>'",
    );
    return undefined;
  }

  console.log(
    "Unlock is handled by 1Password (not this script). If locked, unlock when prompted,",
    "then approve the grant. If no new window appears, check an already-running instance.",
  );

  if (config.ophLaunchMode === "installed") {
    console.log("Opening installed 1Password via onepassword:// handler…");
    await launchInstalledOph(appLink);
    return undefined;
  }

  console.log("Opening local Electron OPH…");
  return launchLocalOph(appLink, config.ophSourceDir);
}

async function pollAccessRequestStatus(client, requestId) {
  const pollIntervalMs = Number.parseInt(
    process.env.OP_ACCESS_REQUEST_POLL_INTERVAL_MS || "1000",
    10,
  );
  const timeoutMs = Number.parseInt(
    process.env.OP_ACCESS_REQUEST_TIMEOUT_MS || "300000",
    10,
  );
  if (
    !Number.isInteger(pollIntervalMs) ||
    pollIntervalMs <= 0 ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs <= 0
  ) {
    throw new Error(
      "OP_ACCESS_REQUEST_POLL_INTERVAL_MS and OP_ACCESS_REQUEST_TIMEOUT_MS must be positive integers",
    );
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status =
      await client.credentialBroker.accessRequests.getStatus(requestId);
    console.log(`  [${requestId}] state: ${status.state}`);

    if (
      status.state === sdk.AccessRequestState.Resolved ||
      status.state === sdk.AccessRequestState.Denied ||
      status.state === sdk.AccessRequestState.Failed ||
      status.state === sdk.AccessRequestState.Expired
    ) {
      return status;
    }
    if (status.state !== sdk.AccessRequestState.Pending) {
      throw new Error(`Unknown access request state: ${status.state}`);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(
    `Access request ${requestId} did not reach a terminal state within ${timeoutMs}ms`,
  );
}

function parsePositiveIntEnvironmentVariable(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return defaultValue;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

/** Canonical path string from SDK resolved entry or read-reference env. */
function credentialReferencePath(reference) {
  if (typeof reference === "string") {
    return reference;
  }
  if (reference && typeof reference.reference === "string") {
    return reference.reference;
  }
  throw new Error(`Invalid credential reference: ${JSON.stringify(reference)}`);
}

function printGrantedLogin({
  label,
  credentialReference,
  credential,
  details,
}) {
  console.log(label);
  console.log(`  reference: ${credentialReferencePath(credentialReference)}`);
  console.log(
    `  websites: ${
      details.websites.length ? details.websites.join(", ") : "(none)"
    }`,
  );
  console.log(`  username: ${credential.username ?? "(missing)"}`);
  if (credential.totp !== undefined) {
    console.log(`  totp: ${credential.totp}`);
  }
  if (process.env.OP_PRINT_GRANTED_PASSWORD === "true") {
    console.log(`  password: ${credential.password ?? "(missing)"}`);
  } else if (credential.password !== undefined) {
    console.log(
      "  password: (redacted; set OP_PRINT_GRANTED_PASSWORD=true to print)",
    );
  } else {
    console.log("  password: (missing)");
  }
}

async function fetchGrantedLogin(client, credentialReference) {
  const path = credentialReferencePath(credentialReference);
  const [credential, details] = await Promise.all([
    client.credentialBroker.logins.read(path),
    client.credentialBroker.logins.getDetails(path),
  ]);
  return { credential, details };
}

async function fetchGrantedLoginsRepeatedly(client, resolvedEntries) {
  const fetchCount = parsePositiveIntEnvironmentVariable(
    "OP_LOGIN_FETCH_COUNT",
    3,
  );
  const fetchIntervalMs = parsePositiveIntEnvironmentVariable(
    "OP_LOGIN_FETCH_INTERVAL_MS",
    1000,
  );

  for (const [entryIndex, entry] of resolvedEntries.entries()) {
    const credentialReference = entry.reference;

    for (let fetchNumber = 1; fetchNumber <= fetchCount; fetchNumber++) {
      console.log(
        `Fetching granted login ${
          entryIndex + 1
        }, attempt ${fetchNumber}/${fetchCount}…`,
      );
      const { credential, details } = await fetchGrantedLogin(
        client,
        credentialReference,
      );
      printGrantedLogin({
        label: `Granted login ${
          entryIndex + 1
        } (fetch ${fetchNumber}/${fetchCount}):`,
        credentialReference,
        credential,
        details,
      });

      if (fetchNumber < fetchCount) {
        await new Promise((resolve) => setTimeout(resolve, fetchIntervalMs));
      }
    }
  }

  return { fetchCount, loginCount: resolvedEntries.length };
}

function websiteMatchesExpected(expectedWebsite, actualWebsites) {
  return actualWebsites.some(
    (website) =>
      website === expectedWebsite ||
      website.includes(expectedWebsite) ||
      expectedWebsite.includes(website),
  );
}

function assertMultiEntryResolution(accessRequest, status) {
  const createdEntries = accessRequest.entries;
  const resolvedEntries = status.resolved ?? [];

  if (resolvedEntries.length !== createdEntries.length) {
    throw new Error(
      `Expected ${createdEntries.length} resolved entries, got ${resolvedEntries.length}`,
    );
  }

  for (const createdEntry of createdEntries) {
    const match = resolvedEntries.filter(
      (resolved) => resolved.entryId === createdEntry.id,
    );
    if (match.length !== 1) {
      throw new Error(
        `Expected exactly one resolved entry for entryId ${createdEntry.id}, got ${match.length}`,
      );
    }
  }
}

async function verifyResolvedWebsitesRegardlessOfOrder(
  client,
  expectedWebsites,
  status,
) {
  const unmatchedExpected = [...expectedWebsites];
  const resolvedEntries = status.resolved ?? [];

  for (const resolved of resolvedEntries) {
    const { details } = await fetchGrantedLogin(client, resolved.reference);
    const actualWebsites = details.websites ?? [];
    const matchIndex = unmatchedExpected.findIndex((expectedWebsite) =>
      websiteMatchesExpected(expectedWebsite, actualWebsites),
    );

    console.log(
      `  entryId=${resolved.entryId ?? "(none)"} websites=[${
        actualWebsites.join(", ") || "none"
      }] → ${credentialReferencePath(resolved.reference)}`,
    );

    if (matchIndex === -1) {
      throw new Error(
        `Unexpected grant websites (${
          actualWebsites.join(", ") || "none"
        }); expected one of: ${unmatchedExpected.join(", ")}`,
      );
    }

    const [matchedWebsite] = unmatchedExpected.splice(matchIndex, 1);
    console.log(`    matched expected website: ${matchedWebsite}`);
  }

  if (unmatchedExpected.length > 0) {
    throw new Error(
      `Missing grants for websites: ${unmatchedExpected.join(", ")}`,
    );
  }
}

async function createAccessRequest(client, config, { label, website }) {
  const { accessRequest, appLink } =
    await client.credentialBroker.accessRequests.create({
      goal: process.env.OP_E2E_GOAL || `E2E broker test (${label})`,
      entries: [loginEntryCreateParams(website, { label })],
    });

  if (accessRequest.state !== sdk.AccessRequestState.Pending) {
    throw new Error(
      `Expected pending access request for ${label}, got ${accessRequest.state}`,
    );
  }

  console.log(`Created access request ${accessRequest.id} (${label})`);
  return { accessRequest, appLink };
}

async function runGrantFlow(client, config, { label, website, expectDenied }) {
  const { accessRequest, appLink } = await createAccessRequest(client, config, {
    label,
    website,
  });
  const ophProcess = await maybeOpenOph(config, appLink, { label });

  try {
    const status = await pollAccessRequestStatus(client, accessRequest.id);

    if (expectDenied) {
      if (status.state !== sdk.AccessRequestState.Denied) {
        throw new Error(
          `Expected denied for ${label}, got ${status.state}. Deny the request in OPH and retry this scenario.`,
        );
      }
      console.log(`PASS: ${label} denied as expected (${accessRequest.id})`);
      return { accessRequest, status, credentialReference: undefined };
    }

    if (status.state !== sdk.AccessRequestState.Resolved) {
      throw new Error(
        `Access request ${accessRequest.id} (${label}) finished with ${status.state}`,
      );
    }
    if (!status.resolved?.length) {
      throw new Error(
        `Resolved access request ${accessRequest.id} returned no credentials`,
      );
    }

    const { fetchCount, loginCount } = await fetchGrantedLoginsRepeatedly(
      client,
      status.resolved,
    );

    const primaryRef = credentialReferencePath(status.resolved[0].reference);
    console.log(`credential_reference=${primaryRef}`);
    console.log(
      `PASS: ${label} resolved; fetched ${loginCount} login(s) ${fetchCount} time(s) each`,
    );

    return {
      accessRequest,
      status,
      credentialReference: status.resolved[0].reference,
    };
  } finally {
    releaseOphProcess(ophProcess);
  }
}

// ---------------------------------------------------------------------------
// E2E scenarios
// ---------------------------------------------------------------------------

async function scenarioHappy(client, config) {
  await runGrantFlow(client, config, {
    label: "happy-path",
    website: config.website,
    expectDenied: false,
  });
}

async function scenarioReadReference(client, config) {
  const credentialReference = config.credentialReference;
  console.log(`Reading credential reference: ${credentialReference}`);

  const { fetchCount } = await fetchGrantedLoginsRepeatedly(client, [
    { reference: credentialReference },
  ]);

  console.log(
    `PASS: read-reference succeeded (${fetchCount} fetch(es) per login)`,
  );
}

async function scenarioDenyThenGrant(client, config) {
  console.log(
    "\nStep 1/2: Deny this request in OPH when the prompt appears.\n",
  );
  await runGrantFlow(client, config, {
    label: "deny-me",
    website: config.website,
    expectDenied: true,
  });

  console.log("\nStep 2/2: Approve this second request in OPH.\n");
  await runGrantFlow(client, config, {
    label: "grant-me",
    website: config.website,
    expectDenied: false,
  });

  console.log("PASS: deny-then-grant completed");
}

async function scenarioTwoRequests(client, config) {
  const { accessRequest: requestA, appLink: linkA } = await createAccessRequest(
    client,
    config,
    {
      label: "request-A",
      website: config.website,
    },
  );
  const { accessRequest: requestB, appLink: linkB } = await createAccessRequest(
    client,
    config,
    {
      label: "request-B",
      website: config.website2,
    },
  );

  console.log(
    "\nApprove BOTH requests in OPH (try reverse order: B first, then A).\n",
  );
  await maybeOpenOph(config, linkA, { label: "Request A app link" });
  await maybeOpenOph(config, linkB, { label: "Request B app link" });

  const [statusA, statusB] = await Promise.all([
    pollAccessRequestStatus(client, requestA.id),
    pollAccessRequestStatus(client, requestB.id),
  ]);

  for (const [label, status] of [
    ["A", statusA],
    ["B", statusB],
  ]) {
    if (status.state !== sdk.AccessRequestState.Resolved) {
      throw new Error(`Request ${label} finished with ${status.state}`);
    }
    if (!status.resolved?.length) {
      throw new Error(`Request ${label} resolved with no credentials`);
    }
    await fetchGrantedLoginsRepeatedly(client, status.resolved);
    console.log(
      `PASS: request ${label} resolved (${credentialReferencePath(status.resolved[0].reference)})`,
    );
  }

  console.log("PASS: two-requests completed");
}

async function scenarioMultiEntry(client, config) {
  const entrySpecs = [
    { label: "login-A", website: config.website },
    { label: "login-B", website: config.website2 },
  ];

  const { accessRequest, appLink } =
    await client.credentialBroker.accessRequests.create({
      goal: process.env.OP_E2E_GOAL || "E2E multi-entry broker test",
      entries: entrySpecs.map(({ label, website }) =>
        loginEntryCreateParams(website, { label }),
      ),
    });

  if (accessRequest.state !== sdk.AccessRequestState.Pending) {
    throw new Error(
      `Expected pending multi-entry access request, got ${accessRequest.state}`,
    );
  }
  if (accessRequest.entries.length !== entrySpecs.length) {
    throw new Error(
      `Expected ${entrySpecs.length} entries on create, got ${accessRequest.entries.length}`,
    );
  }

  console.log(`Created multi-entry access request ${accessRequest.id}:`);
  for (const [index, entry] of accessRequest.entries.entries()) {
    console.log(
      `  entry ${index + 1}: id=${entry.id} website=${
        entry.parameters.website ?? "(none)"
      }`,
    );
  }

  console.log(
    "\nApprove BOTH logins in the single OPH grant prompt.",
    "OPH may sort rows alphabetically (not API order) — match by reason",
    `(login-A → ${config.website}, login-B → ${config.website2}), not row position.\n`,
  );

  const ophProcess = await maybeOpenOph(config, appLink, {
    label: "multi-entry app link",
  });

  try {
    const status = await pollAccessRequestStatus(client, accessRequest.id);

    if (status.state !== sdk.AccessRequestState.Resolved) {
      throw new Error(
        `Multi-entry access request ${accessRequest.id} finished with ${status.state}`,
      );
    }

    assertMultiEntryResolution(accessRequest, status);
    console.log(
      "entryId mapping OK — verifying both websites (order-independent)…",
    );
    await verifyResolvedWebsitesRegardlessOfOrder(
      client,
      [config.website, config.website2],
      status,
    );

    const { fetchCount, loginCount } = await fetchGrantedLoginsRepeatedly(
      client,
      status.resolved,
    );

    for (const resolved of status.resolved) {
      console.log(
        `credential_reference=${credentialReferencePath(resolved.reference)}`,
      );
    }
    console.log(
      `PASS: multi-entry resolved; ${loginCount} login(s) fetched ${fetchCount} time(s) each`,
    );
  } finally {
    releaseOphProcess(ophProcess);
  }
}

async function scenarioExpire(client, config) {
  const { accessRequest, appLink } = await createAccessRequest(client, config, {
    label: "expire-me",
    website: config.website,
  });
  console.log(
    `Leave this request alone — do not open, approve or deny it:\n${appLink}`,
  );
  console.log(
    "Polls until OP_ACCESS_REQUEST_TIMEOUT_MS; set it above the broker's access-request TTL",
    "(Unleash flag credential-broker-credential-brokering-access-request-ttl, default 24h).\n",
  );

  const status = await pollAccessRequestStatus(client, accessRequest.id);
  if (status.state !== sdk.AccessRequestState.Expired) {
    throw new Error(
      `Expected expired for ${accessRequest.id}, got ${status.state}`,
    );
  }
  if (status.resolved?.length) {
    throw new Error(`Expired request ${accessRequest.id} returned credentials`);
  }
  console.log(`PASS: ${accessRequest.id} expired as expected`);
}

// 1Password UUID: base32 of 16 random bytes (26 chars). 128 bits leave the last
// char only 3 bits, so it comes from the 8 symbols whose low 2 bits are zero.
function serverUuid() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = randomBytes(26);
  return (
    Array.from(bytes.subarray(0, 25), (b) => alphabet[b & 31]).join("") +
    "AEIMQUY4"[bytes[25] & 7]
  );
}

/**
 * The integration key is `ops_` + base64url JSON whose `path` is
 * `//host/oauth-clients/<id>/accounts/<account>/users/<user>`.
 */
function decodeIntegrationKey(integrationKey) {
  return JSON.parse(
    Buffer.from(integrationKey.slice("ops_".length), "base64url").toString(),
  );
}

/** A copy of the integration key with one path segment replaced. */
function integrationKeyWithSegment(integrationKey, segment, value) {
  const payload = decodeIntegrationKey(integrationKey);
  const parts = payload.path.split("/");
  parts[parts.indexOf(segment) + 1] = value;
  payload.path = parts.join("/");
  return `ops_${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
}

async function scenarioErrors(client, config) {
  const keyPath = decodeIntegrationKey(config.integrationKey).path.split("/");
  const accountUuid = keyPath[keyPath.indexOf("accounts") + 1];
  // A well-formed login reference in your account for a configuration that doesn't exist.
  const ungrantedReference = `accounts/${accountUuid}/capability/login/configurations/${serverUuid()}`;
  // Access request ids are client UUIDs: the lowercase form.
  const unknownRequestId = serverUuid().toLowerCase();

  const clientWith = (overrides) =>
    sdk.createOAuthClient({
      accessToken: config.accessToken,
      integrationKey: config.integrationKey,
      ...overrides,
    });

  // Every server case below needs a working token; fail fast if yours is rejected.
  try {
    await client.credentialBroker.accessRequests.getStatus(unknownRequestId);
  } catch (error) {
    if (error instanceof sdk.InvalidTokenError) {
      throw new Error(
        "OP_OAUTH_ACCESS_TOKEN was rejected (expired or revoked?). Refresh it and rerun.",
      );
    }
  }

  // [label, expected typed error class, call]
  const cases = [
    // Caught by the SDK before any request is sent.
    [
      "malformed integration key",
      sdk.IntegrationKeyInvalidError,
      async () =>
        (
          await clientWith({ integrationKey: "ops_not-a-key" })
        ).credentialBroker.accessRequests.getStatus(unknownRequestId),
    ],
    [
      "malformed credential reference",
      sdk.InvalidRequestError,
      () => client.credentialBroker.logins.read("not-a-reference"),
    ],
    [
      "credential reference in another account",
      sdk.InvalidRequestError,
      () =>
        client.credentialBroker.logins.read(
          `accounts/${serverUuid()}/capability/login/configurations/${serverUuid()}`,
        ),
    ],
    [
      "malformed access request id",
      sdk.InvalidRequestError,
      () => client.credentialBroker.accessRequests.getStatus("not-a-uuid"),
    ],
    // Reported by the broker.
    [
      "unknown access request id",
      sdk.AccessRequestNotFoundError,
      () => client.credentialBroker.accessRequests.getStatus(unknownRequestId),
    ],
    [
      "invalid access token",
      sdk.InvalidTokenError,
      async () =>
        (
          await clientWith({ accessToken: "op_o_u_e2e_invalid_token" })
        ).credentialBroker.accessRequests.getStatus(unknownRequestId),
    ],
    [
      `login with no grant (${ungrantedReference})`,
      sdk.NoActiveGrantError,
      () => client.credentialBroker.logins.read(ungrantedReference),
    ],
    [
      // The broker reports IDENTITY_MISMATCH, which the SDK surfaces as IntegrationKeyInvalidError.
      "integration key for another user",
      sdk.IntegrationKeyInvalidError,
      async () =>
        (
          await clientWith({
            integrationKey: integrationKeyWithSegment(
              config.integrationKey,
              "users",
              serverUuid(),
            ),
          })
        ).credentialBroker.logins.read(ungrantedReference),
    ],
  ];

  // These need account state the script can't create, so they run only when set.
  const optionalCases = [
    // A grant that has expired (grant TTL elapsed); the SDK folds this into NoActiveGrantError.
    ["OP_E2E_EXPIRED_GRANT_REFERENCE", sdk.NoActiveGrantError],
    // A granted login that was then deleted or moved; the OAuth client can't delete items.
    ["OP_E2E_DELETED_REFERENCE", sdk.CredentialNotFoundError],
  ];
  for (const [name, expected] of optionalCases) {
    const reference = process.env[name];
    if (reference) {
      cases.push([
        name,
        expected,
        () => client.credentialBroker.logins.read(reference),
      ]);
    } else {
      console.log(`SKIP: ${expected.name} (set ${name} to test)`);
    }
  }

  let failures = 0;
  for (const [label, expected, call] of cases) {
    try {
      await call();
      console.log(`FAIL: ${label} — call succeeded, expected ${expected.name}`);
      failures++;
    } catch (error) {
      const outcome = `${error.constructor.name}: ${error.message}`;
      if (error instanceof expected) {
        console.log(`PASS: ${label} → ${outcome}`);
      } else {
        console.log(`FAIL: ${label} — expected ${expected.name}, got ${outcome}`);
        failures++;
      }
    }
  }
  if (failures) {
    throw new Error(`${failures} error case(s) failed`);
  }
  console.log("PASS: errors completed");
}

async function runE2E() {
  const config = await loadE2EConfig();
  const client = await createBrokerOAuthClient(config);

  switch (config.scenario) {
    case "happy":
      await scenarioHappy(client, config);
      break;
    case "read-reference":
      await scenarioReadReference(client, config);
      break;
    case "deny-then-grant":
      await scenarioDenyThenGrant(client, config);
      break;
    case "two-requests":
      await scenarioTwoRequests(client, config);
      break;
    case "multi-entry":
      await scenarioMultiEntry(client, config);
      break;
    case "expire":
      await scenarioExpire(client, config);
      break;
    case "errors":
      await scenarioErrors(client, config);
      break;
    default:
      throw new Error(`Unhandled scenario: ${config.scenario}`);
  }
}

runE2E().catch((error) => {
  console.error(`E2E failed (${error?.constructor?.name}):`, error);
  process.exitCode = 1;
});
