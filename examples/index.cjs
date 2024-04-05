const sdk = require("@1password/sdk")

async function fetchSecret() {
  // Creates an authenticated client.
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  // Fetches a secret.
  // See syntax here: https://developer.1password.com/docs/cli/secrets-reference-syntax/
  return await client.secrets.resolve("op://SDKs Test/Test Login/username");
}

fetchSecret().then(console.log)
