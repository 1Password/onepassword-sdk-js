import sdk from "@1password/sdk";

let client;
try {
  client = await sdk.createClient({
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
    oidcFetcher: async () => "hello from the sdk",
    workloadDetails: {
      customerManagedSecret: "fake_customer_managed_secret",
      workloadUuid: "ff",
    },
  });
} catch (err) {
  console.error("createClient failed:", err.message ?? err);
  process.exit(1);
}

console.log("\n=== Items (first vault) ===");
try {
  const vaults = await client.vaults.list();
  if (vaults.length > 0) {
    const vaultId = vaults[0].id;
    console.log(`Listing items in vault "${vaults[0].title}"...`);
    const items = await client.items.list(vaultId);
    if (items.length === 0) {
      console.log("  (no items found)");
    } else {
      for (const item of items.slice(0, 10)) {
        console.log(`  ${item.title}  (${item.id})`);
      }
      if (items.length > 10) {
        console.log(`  ... and ${items.length - 10} more`);
      }
    }
  }
} catch (err) {
  console.error("items.list failed:", err.message ?? err);
}

console.log("\n=== Get Environments Variables ===");
try {
  const variables = await client.environments.getVariables("<env_id>");
  console.log(JSON.stringify(variables, null, 2));
} catch (err) {
  console.error("environments.getVariables failed:", err.message ?? err);
}
