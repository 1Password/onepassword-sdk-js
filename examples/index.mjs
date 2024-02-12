import { createClient, DEFAULT_INTEGRATION_NAME, DEFAULT_INTEGRATION_VERSION } from "@1password/sdk";

// Creates an authenticated client.
const client = await createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
  integrationName: DEFAULT_INTEGRATION_NAME,
  integrationVersion: DEFAULT_INTEGRATION_VERSION,
});

// Fetches a secret.
const secret = await client.secrets.resolve("op://vault/item/field");
console.log(secret)

