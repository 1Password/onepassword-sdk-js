import sdk from "@1password/sdk";

let client;
try {
  client = await sdk.createClient({
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
    oidcFetcher: async () => "oidc_token",
    workloadDetails: {
      customerManagedSecret: "customer_managed_secret",
      workloadUuid: "workload_uuid",
    },
  });
} catch (err) {
  console.error("createClient failed:", err.message ?? err);
  process.exit(1);
}

let x = await client.environments.getVariables("environment_id");
console.log(x);
