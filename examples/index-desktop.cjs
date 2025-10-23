// [developer-docs.sdk.js/common-js.sdk-import]-start
const sdk = require("@1password/sdk");
// [developer-docs.sdk.js/common-js.sdk-import]-end

async function main() {
  // [developer-docs.sdk.js.client-initialization]-start
  // Connects to the 1Password desktop app.  
  const client = await sdk.createClient({
    auth: new sdk.DesktopAuth("YourAccountNameAsItAppearsInTheApp"),
    // Set the following to your own integration name and version.
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });
  // [developer-docs.sdk.js.client-initialization]-end

  // [developer-docs.sdk.python.list-vaults]-start
  const vaults = await client.vaults.list({ decryptDetails: true });
  for await (const vault of vaults) {
    console.log(JSON.stringify(vault, null, 2));
  }
  // [developer-docs.sdk.python.list-vaults]-end

  const vaultId = process.env.OP_VAULT_ID;

  if (!vaultId) {
    throw new Error("Missing required environment variable: OP_VAULT_ID");
  }

  // [developer-docs.sdk.python.list-items]-start
  const items = await client.items.list(vaultId);
  for await (const item of items) {
    console.log(item.id + " " + item.title);
  }
  // [developer-docs.sdk.python.list-items]-end
}

main();
