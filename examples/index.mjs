import { createClient } from "@1password/sdk";

// Creates an authenticated client.
const client = await createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
  integrationName: "My 1Password Integration",
  integrationVersion: "v1.0.0",
});

// Fetches a secret.
const secret = await client.secrets.resolve("op://vault/item/field");
console.log(secret)
