// [developer-docs.sdk.js/common-js.sdk-import]-start
const sdk = require("@1password/sdk");
// [developer-docs.sdk.js/common-js.sdk-import]-end
const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

function requiredEnvironmentVariable(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Mints the deep link the desktop app classifies as
// `UrlClassification::GrantBrokeredAccess`. The host and the parameter
// encoding are both load-bearing: core matches the host
// `grant-brokered-access` exactly, and `AccessRequestDetails::decode` reads
// `access_request_reference` as base64url (not standard base64). The blob is
// the whole SDK access request — core keeps the sensitive presentation fields
// (goal, reason, keywords, website) that never reach the server, and drops the
// server-managed ones in favour of the template it fetches from the broker.
function brokeredAccessAppLink(accessRequest) {
  const link = new URL("onepassword://grant-brokered-access");
  link.searchParams.set(
    "access_request_reference",
    Buffer.from(JSON.stringify(accessRequest)).toString("base64url"),
  );
  return link.toString();
}

async function launchLocalOph(appLink) {
  const ophSourceDir = requiredEnvironmentVariable("OPH_SOURCE_DIR");
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
      `Local Electron executable not found at ${electronExecutable}; install the OPH dependencies first`,
    );
  }

  return new Promise((resolve, reject) => {
    // This is the same local Electron launch as `pnpm start <url>` in js/oph.
    // It deliberately does not use macOS's registered onepassword:// handler,
    // which could select an installed app from /Applications.
    const electronEnvironment = { ...process.env };
    delete electronEnvironment.ELECTRON_RUN_AS_NODE;

    const child = spawn(electronExecutable, ["./dist/app/main.js", appLink], {
      cwd: ophSourceDir,
      detached: false,
      env: electronEnvironment,
      // Keep Electron attached, but send its noisy stdout/stderr to /dev/null
      // so this terminal shows only the SDK flow.
      stdio: "ignore",
    });

    child.once("error", reject);
    child.once("spawn", () => resolve(child));
  });
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
    console.log(`Polling access request ${requestId}, status: ${status.state}`);

    if (
      status.state === sdk.AccessRequestState.Resolved ||
      status.state === sdk.AccessRequestState.Denied ||
      status.state === sdk.AccessRequestState.Failed
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

function printGrantedLogin({
  label,
  credentialReference,
  credential,
  details,
}) {
  console.log(label);
  console.log(`  reference: ${credentialReference.reference}`);
  console.log(
    `  websites: ${details.websites.length ? details.websites.join(", ") : "(none)"}`,
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
  const [credential, details] = await Promise.all([
    client.credentialBroker.logins.read(credentialReference),
    client.credentialBroker.logins.getDetails(credentialReference),
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
        `Fetching granted login ${entryIndex + 1}, attempt ${fetchNumber}/${fetchCount}...`,
      );
      const { credential, details } = await fetchGrantedLogin(
        client,
        credentialReference,
      );
      printGrantedLogin({
        label: `Granted login ${entryIndex + 1} (fetch ${fetchNumber}/${fetchCount}):`,
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

async function demonstrateOAuthClient() {
  const accountUuid = requiredEnvironmentVariable("OP_ACCOUNT_UUID");

  const client = await sdk.createOAuthClient({
    accessToken: requiredEnvironmentVariable("OP_OAUTH_ACCESS_TOKEN"),
    integrationKey: requiredEnvironmentVariable("OP_OAUTH_INTEGRATION_KEY"),
  });

  const accessRequest = await client.credentialBroker.accessRequests.create({
    entries: [
      {
        type: sdk.AccessRequestEntryType.Login,
        parameters: {},
      },
    ],
  });

  if (accessRequest.state !== sdk.AccessRequestState.Pending) {
    throw new Error(
      `Expected a pending access request, got ${accessRequest.state}`,
    );
  }

  console.log(
    `Created access request ${accessRequest.id}; opening local OPH and polling for approval...`,
  );

  const appLink = brokeredAccessAppLink(accessRequest);
  console.log(`Opening ${appLink}`);
  const ophProcess = await launchLocalOph(appLink);
  try {
    const status = await pollAccessRequestStatus(client, accessRequest.id);

    if (status.state !== sdk.AccessRequestState.Resolved) {
      throw new Error(
        `Access request ${accessRequest.id} finished with state ${status.state}`,
      );
    }
    if (!status.resolved?.length) {
      throw new Error(
        `Resolved access request ${accessRequest.id} returned no credential references`,
      );
    }

    const { fetchCount, loginCount } = await fetchGrantedLoginsRepeatedly(
      client,
      status.resolved,
    );

    console.log(
      `OAuth authentication, approval, and credential fetch succeeded for access request ${accessRequest.id}; fetched ${loginCount} login credential(s) ${fetchCount} time(s) each.`,
    );
  } finally {
    if (ophProcess.exitCode === null && ophProcess.signalCode === null) {
      ophProcess.kill();
    }
  }
}

async function fetchSecret(vaultId, itemId) {
  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    // Set the following to your own integration name and version
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });
  return await client.secrets.resolve(
    "op://" + vaultId + "/" + itemId + "/username",
  );
}

async function manageItems() {
  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  const vaults = await client.vaults.list();

  for await (const vault of vaults) {
    console.log(vault.id + " " + vault.title);
    const items = await client.items.list(vault.id);
    for await (const item of items) {
      console.log(item.id + " " + item.title);
    }
  }

  vaultId = process.env.OP_VAULT_ID;

  // Create an item
  let item = await client.items.create({
    title: "My Item",
    category: sdk.ItemCategory.Login,
    vaultId: vaultId,
    fields: [
      {
        id: "username",
        title: "username",
        fieldType: sdk.ItemFieldType.Text,
        value: "my username",
      },
      {
        id: "password",
        title: "password",
        fieldType: sdk.ItemFieldType.Concealed,
        value: "my secret value",
      },
      {
        id: "onetimepassword",
        title: "one-time password",
        sectionId: "custom section",
        fieldType: sdk.ItemFieldType.Totp,
        value:
          "otpauth://totp/my-example-otp?secret=jncrjgbdjnrncbjsr&issuer=1Password",
      },
    ],
    sections: [
      {
        id: "custom section",
        title: "my section",
      },
    ],
    tags: ["test tag 1", "test tag 2"],
    websites: [
      {
        url: "example.com",
        label: "url",
        autofillBehavior: sdk.AutofillBehavior.AnywhereOnWebsite,
      },
    ],
  });

  fetchSecret(item.vaultId, item.id).then(console.log);

  // Get a one-time password code from an item
  let element = item.fields.find((element) => {
    return element.fieldType == sdk.ItemFieldType.Totp;
  });

  if (!element) {
    console.error("no totp field found on item");
    return;
  }

  switch (element.details.type) {
    case "Otp": {
      if (element.details.content.code) {
        console.log(element.details.content.code);
      } else {
        console.error(element.details.content.errorMessage);
      }
    }
    default:
  }

  // Update an item (change the password)
  let newItem = {
    ...item,
    fields: item.fields.map((f) => {
      if (f.title == "password") {
        return { ...f, value: "my-new-password" };
      } else {
        return f;
      }
    }),
  };
  let updatedItem = await client.items.put(newItem);
  console.log(updatedItem.fields);

  // Delete an item
  await client.items.delete(item.vaultId, item.id);
}

function generatePassword() {
  try {
    let pinPassword = sdk.Secrets.generatePassword({
      type: "Pin",
      parameters: {
        length: 8,
      },
    });
    console.log(pinPassword);
  } catch (error) {
    console.error(error);
  }

  try {
    let memorablePassword = sdk.Secrets.generatePassword({
      type: "Memorable",
      parameters: {
        separatorType: sdk.SeparatorType.Digits,
        capitalize: true,
        wordListType: sdk.WordListType.FullWords,
        wordCount: 8,
      },
    });
    console.log(memorablePassword);
  } catch (error) {
    console.error(error);
  }

  try {
    let randomPassword = sdk.Secrets.generatePassword({
      type: "Random",
      parameters: {
        includeDigits: true,
        includeSymbols: true,
        length: 8,
      },
    });
    console.log(randomPassword);
  } catch (error) {
    console.error(error);
  }
}

async function showcaseVaultOperations() {
  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  // Create a vault
  createdVault = await client.vaults.create({
    title: "JS SDK Vault",
    description: "A vault created via the JS SDK",
  });
  console.log(`Created vault "${createdVault.title}" (${createdVault.id})`);

  // Get a vault overview
  const vaultOverview = await client.vaults.getOverview(createdVault.id);
  console.log(JSON.stringify(vaultOverview));

  // Update a vault
  await client.vaults.update(createdVault.id, {
    title: "JS SDK Vault Updated",
    description: "An updated vault created via the SDK",
  });
  console.log(`Updated vault "${createdVault.id}"`);

  // Get vault details
  const vault = await client.vaults.get(createdVault.id, { accessors: false });
  console.log(JSON.stringify(vault));

  // Delete a vault
  await client.vaults.delete(createdVault.id);
  console.log(`Deleted vault "${createdVault.id}"`);

  // List vaults
  const vaults = await client.vaults.list({ decryptDetails: true });
  for await (const vault of vaults) {
    console.log(JSON.stringify(vault, null, 2));
  }
}

async function showcaseBatchItemOperations() {
  const vaultId = process.env.OP_VAULT_ID;

  if (!vaultId) {
    throw new Error("Missing required environment variable: OP_VAULT_ID");
  }

  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  itemsToCreate = [];
  for (let i = 1; i <= 3; i++) {
    itemsToCreate.push({
      title: `My Login Item ${i}`,
      category: sdk.ItemCategory.Login,
      vaultId,
      fields: [
        {
          id: "username",
          title: "username",
          fieldType: sdk.ItemFieldType.Text,
          value: "my username",
        },
        {
          id: "password",
          title: "password",
          fieldType: sdk.ItemFieldType.Concealed,
          value: "my secret value",
        },
        {
          id: "onetimepassword",
          title: "one-time password",
          sectionId: "custom section",
          fieldType: sdk.ItemFieldType.Totp,
          value:
            "otpauth://totp/my-example-otp?secret=jncrjgbdjnrncbjsr&issuer=1Password",
        },
      ],
      sections: [
        {
          id: "custom section",
          title: "my section",
        },
      ],
      tags: ["test tag 1", "test tag 2"],
      websites: [
        {
          url: "example.com",
          label: "url",
          autofillBehavior: sdk.AutofillBehavior.AnywhereOnWebsite,
        },
      ],
    });
  }

  // Batch create all items in the same vault
  const batchCreateResponse = await client.items.createAll(
    vaultId,
    itemsToCreate,
  );

  let itemIDs = [];
  for (const res of batchCreateResponse.individualResponses) {
    if (res.content) {
      console.log(`Created item "${res.content.title}" (${res.content.id})`);
      itemIDs.push(res.content.id);
    } else if (res.error) {
      console.log(`[Batch create] Something went wrong: ${res.error}`);
    }
  }

  // Get multiple items from the same vault
  const batchGetResponse = await client.items.getAll(vaultId, itemIDs);
  for (const res of batchGetResponse.individualResponses) {
    if (res.content) {
      console.log(`Obtained item "${res.content.title}" (${res.content.id})`);
    } else if (res.error) {
      console.log(`[Batch get] Something went wrong: ${res.error}`);
    }
  }

  // Delete multiple items from the same vault
  const batchDeleteResponse = await client.items.deleteAll(vaultId, itemIDs);
  for (const [id, res] of Object.entries(
    batchDeleteResponse.individualResponses,
  )) {
    if (res.error) {
      console.log(`[Batch delete] Something went wrong: ${res.error}`);
    } else {
      console.log(`Deleted item ${id}`);
    }
  }
}

if (
  process.env.OP_OAUTH_ACCESS_TOKEN ||
  process.env.OP_OAUTH_INTEGRATION_KEY ||
  process.env.OP_ACCOUNT_UUID
) {
  demonstrateOAuthClient().catch((error) => {
    console.error("Error in OAuth client example:", error);
    process.exitCode = 1;
  });
} else {
  manageItems();
  generatePassword();
  showcaseVaultOperations();
  showcaseBatchItemOperations();
}
