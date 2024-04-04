const sdk = require("@1password/sdk")

async function fetchSecret() {
  // Creates an authenticated client.
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  // Fetches a secret.
  return await client.secrets.resolve("op://gowwbvgow7kxocrfmfvtwni6vi/6ydrn7ne6mwnqc2prsbqx4i4aq/password");
}

fetchSecret().then(console.log)
