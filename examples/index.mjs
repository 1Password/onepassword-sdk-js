import { createClient } from "@1password/sdk";

// Creates an authenticated client.
const client = await createClient({
  auth: "<your_service_account_token>",
  integrationName: "<your_integration_name>",
  integrationVersion: "<your_integration_version>",
});

// Fetches a secret.
const secret = await client.secrets.resolve("op://Private/Netflix/website");