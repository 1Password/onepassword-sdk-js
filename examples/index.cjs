const sdk = require("@1password/sdk")

async function fetchSecret() {
  // Creates an authenticated client.
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  // Fetches a secret.
  return await client.secrets.resolve("op://vault/item/field");
}

fetchSecret().then(console.log)
