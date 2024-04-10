const sdk = require("@1password/sdk")

// Gets your service account token from the OP_SERVICE_ACCOUNT_TOKEN environment variable.
// Authenticates with your token and connects to 1Password.
async function fetchSecret() {
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

// Retrieves a secret from 1Password. 
// Takes a secret reference as input and returns the secret to which it points.
  return await client.secrets.resolve("op://vault/item/field");
}

fetchSecret().then(console.log)
