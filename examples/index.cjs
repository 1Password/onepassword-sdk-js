// [developer-docs.sdk.js/common-js.sdk-import]-start
const sdk = require("@1password/sdk");
// [developer-docs.sdk.js/common-js.sdk-import]-end

async function fetchSecret(vaultId, itemId) {
  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    // Set the following to your own integration name and version
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });
  return await client.secrets.resolve(
    "op://" + vaultId + "/" + itemId + "/username",
  );
}

async function manageItems() {
  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  const vaults = await client.vaults.list();

  for await (const vault of vaults) {
    console.log(vault.id + " " + vault.title);
    const items = await client.items.list(vault.id);
    for await (const item of items) {
      console.log(item.id + " " + item.title);
    }
  }

  vaultId = process.env.OP_VAULT_ID;

  // Create an item
  let item = await client.items.create({
    title: "My Item",
    category: sdk.ItemCategory.Login,
    vaultId: vaultId,
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
  });

  fetchSecret(item.vaultId, item.id).then(console.log);

  // Get a one-time password code from an item
  let element = item.fields.find((element) => {
    return element.fieldType == sdk.ItemFieldType.Totp;
  });

  if (!element) {
    console.error("no totp field found on item");
    return;
  }

  switch (element.details.type) {
    case "Otp": {
      if (element.details.content.code) {
        console.log(element.details.content.code);
      } else {
        console.error(element.details.content.errorMessage);
      }
    }
    default:
  }

  // Update an item (change the password)
  let newItem = {
    ...item,
    fields: item.fields.map((f) => {
      if (f.title == "password") {
        return { ...f, value: "my-new-password" };
      } else {
        return f;
      }
    }),
  };
  let updatedItem = await client.items.put(newItem);
  console.log(updatedItem.fields);

  // Delete an item
  await client.items.delete(item.vaultId, item.id);
}

function generatePassword() {
  try {
    let pinPassword = sdk.Secrets.generatePassword({
      type: "Pin",
      parameters: {
        length: 8,
      },
    });
    console.log(pinPassword);
  } catch (error) {
    console.error(error);
  }

  try {
    let memorablePassword = sdk.Secrets.generatePassword({
      type: "Memorable",
      parameters: {
        separatorType: sdk.SeparatorType.Digits,
        capitalize: true,
        wordListType: sdk.WordListType.FullWords,
        wordCount: 8,
      },
    });
    console.log(memorablePassword);
  } catch (error) {
    console.error(error);
  }

  try {
    let randomPassword = sdk.Secrets.generatePassword({
      type: "Random",
      parameters: {
        includeDigits: true,
        includeSymbols: true,
        length: 8,
      },
    });
    console.log(randomPassword);
  } catch (error) {
    console.error(error);
  }
}

async function showcaseVaultOperations() {
  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  // Create a vault
  createdVault = await client.vaults.create({
    title: "JS SDK Vault",
    description: "A vault created via the JS SDK",
  });
  console.log(`Created vault "${createdVault.title}" (${createdVault.id})`);

  // Get a vault overview
  const vaultOverview = await client.vaults.getOverview(createdVault.id);
  console.log(JSON.stringify(vaultOverview));

  // Update a vault
  await client.vaults.update(createdVault.id, {
    title: "JS SDK Vault Updated",
    description: "An updated vault created via the SDK",
  });
  console.log(`Updated vault "${createdVault.id}"`);

  // Get vault details
  const vault = await client.vaults.get(createdVault.id, { accessors: false });
  console.log(JSON.stringify(vault));

  // Delete a vault
  await client.vaults.delete(createdVault.id);
  console.log(`Deleted vault "${createdVault.id}"`);

  // List vaults
  const vaults = await client.vaults.list({ decryptDetails: true });
  for await (const vault of vaults) {
    console.log(JSON.stringify(vault, null, 2));
  }
}

async function showcaseBatchItemOperations() {
  const vaultId = process.env.OP_VAULT_ID;

  if (!vaultId) {
    throw new Error("Missing required environment variable: OP_VAULT_ID");
  }

  // Create an authenticated client
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  itemsToCreate = [];
  for (let i = 1; i <= 3; i++) {
    itemsToCreate.push({
      title: `My Login Item ${i}`,
      category: sdk.ItemCategory.Login,
      vaultId,
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
    });
  }

  // Batch create all items in the same vault
  const batchCreateResponse = await client.items.createAll(
    vaultId,
    itemsToCreate,
  );

  let itemIDs = [];
  for (const res of batchCreateResponse.individualResponses) {
    if (res.content) {
      console.log(`Created item "${res.content.title}" (${res.content.id})`);
      itemIDs.push(res.content.id);
    } else if (res.error) {
      console.log(`[Batch create] Something went wrong: ${res.error}`);
    }
  }

  // Get multiple items from the same vault
  const batchGetResponse = await client.items.getAll(vaultId, itemIDs);
  for (const res of batchGetResponse.individualResponses) {
    if (res.content) {
      console.log(`Obtained item "${res.content.title}" (${res.content.id})`);
    } else if (res.error) {
      console.log(`[Batch get] Something went wrong: ${res.error}`);
    }
  }

  // Delete multiple items from the same vault
  const batchDeleteResponse = await client.items.deleteAll(vaultId, itemIDs);
  for (const [id, res] of Object.entries(
    batchDeleteResponse.individualResponses,
  )) {
    if (res.error) {
      console.log(`[Batch delete] Something went wrong: ${res.error}`);
    } else {
      console.log(`Deleted item ${id}`);
    }
  }
}

manageItems();
generatePassword();
showcaseVaultOperations();
showcaseBatchItemOperations();
