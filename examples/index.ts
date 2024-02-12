import { createClient } from "../src/client";

// Creates an authenticated client.
const client = await createClient({
  auth: "<your_service_account_token>",
  integrationName: "<your_integration_name>",
  integrationVersion: "<your_integration_version>",
});

// Fetches a secret.
const secret = await client.secrets.resolve("op://vault/item/field");
