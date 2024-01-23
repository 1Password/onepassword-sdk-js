import { createClient } from "../client";

async function main() {
  // create an authenticated client
  const client = await createClient({
    auth: "<your_service_account_token>",
    integrationName: "<your_integration_name>",
    integrationVersion: "<your_integration_version>",
  });

  // fetch secret
  const secret = await client.secrets.resolve("op://Private/Netflix/website");
}
