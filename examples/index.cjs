// [developer-docs.sdk.js/common-js.sdk-import]-start
const sdk = require("@1password/sdk");
// [developer-docs.sdk.js/common-js.sdk-import]-end

async function fetchSecret() {
  // Creates an authenticated client.
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    // TODO: Set the following to your own integration name and version.
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  return await client.secrets.resolve("op://vault/item/field");
}

async function manageItems() {
  // Creates an authenticated client.
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "My 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  const vaults = await client.vaults.listAll();

  for await (const vault of vaults) {
    console.log(vault.id + " " + vault.title);
    const items = await client.items.listAll(vault.id);
    for await (const item of items) {
      console.log(item.id + " " + item.title);
    }
  }

  // Creates an item with a username, password, one-time password, autofill website, and tags.
  let item = await client.items.create({
    title: "My Item",
    category: sdk.ItemCategory.Login,
    vaultId: "7turaasywpymt3jecxoxk5roli",
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

  // Gets a one-time password code from the item created in the previous step.
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

  // Updates the item by changing its password.
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

  // Deletes the item.
  await client.items.delete(item.vaultId, item.id);
}

manageItems();
fetchSecret().then(console.log);
