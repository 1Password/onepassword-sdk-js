import sdk from "@1password/sdk";

let token = process.env.OP_SERVICE_ACCOUNT_TOKEN

const client = await sdk.createClient({
  auth: "",
  // Set the following to your own integration name and version.
  integrationName: "My 1Password Integration",
  integrationVersion: "v1.0.0",
});

const vaults = client.vaults.list()
// [developer-docs.sdk.js/es-modules.sdk-import]-end