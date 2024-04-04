import { createClient } from "@1password/sdk";

// Creates an authenticated client.
const client = await createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
  integrationName: "My 1Password Integration",
  integrationVersion: "v1.0.0",
});

// Fetches a secret.
// See syntax here: https://developer.1password.com/docs/cli/secrets-reference-syntax/
const secret = await client.secrets.resolve("op://SDKs Test/Test Login/username");
console.log(secret)
