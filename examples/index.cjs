async function fetchSecret() {
  const {createClient ,DEFAULT_INTEGRATION_NAME, DEFAULT_INTEGRATION_VERSION} = await import("@1password/sdk");
  // Creates an authenticated client.
  const client = await createClient({
    auth: "<your_service_account_token>",
    integrationName: DEFAULT_INTEGRATION_NAME,
    integrationVersion: DEFAULT_INTEGRATION_VERSION,
  });

  // Fetches a secret.
  return await client.secrets.resolve("op://vault/item/field");
}

fetchSecret().then(console.log)
