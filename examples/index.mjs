import * as fs from "fs";

import crypto from "crypto";
// [developer-docs.sdk.js/es-modules.sdk-import]-start
import sdk from "@1password/sdk";

// [developer-docs.sdk.js/es-modules.sdk-import]-end

// [developer-docs.sdk.js.client-initialization]-start
// Create an authenticated client
const client = await sdk.createClient({
  // Set to your own integration name and version
  integrationName: "My 1Password Integration",
  integrationVersion: "v1.0.0",
  oidcFetcher: async () => "hello from the sdk",
  customerManagedSecret: "fake_customer_managed_secret",
});
// [developer-docs.sdk.js.client-initialization]-end

// [developer-docs.sdk.js.list-vaults]-start
const vaults = await client.vaults.list();
for (const vault of vaults) {
  console.log(vault);
}
// [developer-docs.sdk.js.list-vaults]-end

const vaultId = process.env.OP_VAULT_ID;

if (!vaultId) {
  throw new Error("Missing required environment variable: OP_VAULT_ID");
}
