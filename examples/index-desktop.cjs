// [developer-docs.sdk.js/common-js.sdk-import]-start
const sdk = require("@1password/sdk");
// [developer-docs.sdk.js/common-js.sdk-import]-end

async function main() {
  const vaultId = process.env.OP_VAULT_ID;

  if (!vaultId) {
    throw new Error("Missing required environment variable: OP_VAULT_ID")
  }

  // [developer-docs.sdk.js/common-js.client-initialization]-start
  // Connects to the 1Password desktop app.  
  const client = await sdk.createClient({
    auth: new sdk.DesktopAuth("Happy Company"),
    // Set the following to your own integration name and version.
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });
  // [developer-docs.sdk.js/common-js.client-initialization]-end

  // [developer-docs.sdk.js/common-js.list-vaults]-start
  const vaults = await client.vaults.list({ decryptDetails: true });
  for await (const vault of vaults) {
    console.log(JSON.stringify(vault, null, 2));
  }
  // [developer-docs.sdk.js/common-js.list-vaults]-end

  // [developer-docs.sdk.js/common-js.list-items]-start
  const items = await client.items.list(vaultId);
  for await (const item of items) {
    console.log(item.id + " " + item.title);
  }
  // [developer-docs.sdk.js/common-js.list-items]-end

  // [developer-docs.sdk.js/common-js.get-vault-overview]-start
	// Get vault overview
  const vaultOverview = await client.vaults.getOverview(vaultId);
  console.log(JSON.stringify(vaultOverview));
	// [developer-docs.sdk.js/common-js.get-vault-overview]-end

  // [developer-docs.sdk.js/common-js.get-vault-details]-start
	// Get vault details
  const vault = await client.vaults.get(vaultOverview.id, {accessors: false});
  console.log(JSON.stringify(vault));
  // [developer-docs.sdk.js/common-js.get-vault-details]-end

  // [developer-docs.sdk.js/common-js.batch-create-items]-start
  itemsToCreate = [];
  for (let i = 1; i <= 3; i++) {
    itemsToCreate.push({
      title: `My Login Item ${i}`,
      category: sdk.ItemCategory.Login,
      vaultId: vault.id,
      fields: [
        {
          id: "username",
          title: "username",
          fieldType: sdk.ItemFieldType.Text,
          value: "my username",
        },
        {
          id: "password",
          title: "password",
          fieldType: sdk.ItemFieldType.Concealed,
          value: "my secret value",
        },
        {
          id: "onetimepassword",
          title: "one-time password",
          sectionId: "custom section",
          fieldType: sdk.ItemFieldType.Totp,
          value:
            "otpauth://totp/my-example-otp?secret=jncrjgbdjnrncbjsr&issuer=1Password",
        },
      ],
      sections: [
        {
          id: "custom section",
          title: "my section",
        },
      ],
      tags: ["test tag 1", "test tag 2"],
      websites: [
        {
          url: "example.com",
          label: "url",
          autofillBehavior: sdk.AutofillBehavior.AnywhereOnWebsite,
        },
      ],
    })
  }

	// Create all items in the same vault in a single batch
  const batchCreateResponse = await client.items.createAll(vault.id, itemsToCreate)

  let itemIDs = [];
  for (const res of batchCreateResponse.individualResponses) {
    if (res.content) {
      console.log(`Created item "${res.content.title}" (${res.content.id})`);
      itemIDs.push(res.content.id);
    }
    else if (res.error) {
      console.log(`[Batch create] Something went wrong: ${res.error}`);
    }
  }
  // [developer-docs.sdk.js/common-js.batch-create-items]-end

  // [developer-docs.sdk.js/common-js.batch-get-items]-start
	// Get multiple items form the same vault in a single batch
  const batchGetResponse = await client.items.getAll(vault.id, itemIDs);
  for (const res of batchGetResponse.individualResponses) {
    if (res.content) {
      console.log(`Obtained item "${res.content.title}" (${res.content.id})`);
    }
    else if (res.error) {
      console.log(`[Batch get] Something went wrong: ${res.error}`);
    }
  }
  // [developer-docs.sdk.js/common-js.batch-get-items]-end

  // [developer-docs.sdk.js/common-js.batch-delete-items]-start
	// Delete multiple items from the same vault in a single batch
  const batchDeleteResponse = await client.items.deleteAll(vault.id, itemIDs);
  for (const [id, res] of Object.entries(batchDeleteResponse.individualResponses)) {
    if (res.error) {
      console.log(`[Batch delete] Something went wrong: ${res.error}`);
    }
    else {
      console.log(`Deleted item ${id}`);
    }
  }
  // [developer-docs.sdk.js/common-js.batch-delete-items]-end

  const groupId = process.env.OP_GROUP_ID;

  if (!groupId) {
    throw new Error("Missing required environment variable: OP_GROUP_ID")
  }

  // [developer-docs.sdk.js/common-js.get-group]-start
  // Get a group
  const group = await client.groups.get(groupId, {vaultPermissions: false})
  console.log(JSON.stringify(group))
  // [developer-docs.sdk.js/common-js.get-group]-end
}

main();
