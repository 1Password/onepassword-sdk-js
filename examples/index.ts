import { createClient } from "../src/client";

// Creates an authenticated client.
const client = await createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
  integrationName: "<your_integration_name>",
  integrationVersion: "<your_integration_version>",
});

// Fetches a secret.
const secret = await client.secrets.resolve("op://vault/item/field");
