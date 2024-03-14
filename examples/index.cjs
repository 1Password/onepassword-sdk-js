const sdk = require("@1password/sdk")

async function fetchSecret() {
  // Creates an authenticated client.
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My_Project_Name",
    integrationVersion: "x.x.x",
  });

  // Fetches a secret.
  return await client.secrets.resolve("op://vault/item/field");
}

fetchSecret().then(console.log)
