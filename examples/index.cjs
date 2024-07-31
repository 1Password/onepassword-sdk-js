const sdk = require("@1password/sdk");

async function fetchSecret() {
  // Creates an authenticated client.
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    // Set the following to your own integration name and version.
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

  // Create an item
  let item = await client.items.create({
    title: "My Item",
    category: sdk.ItemCategory.Login,
    vault_id: "7turaasywpymt3jecxoxk5roli",
    fields: [
      {
        id: "username",
        title: "username",
        field_type: sdk.ItemFieldType.Text,
        value: "my username",
      },
      {
        id: "password",
        title: "password",
        field_type: sdk.ItemFieldType.Concealed,
        value: "my secret value",
      },
      {
        id: "onetimepassword",
        title: "one-time password",
        section_id: "custom section",
        field_type: sdk.ItemFieldType.Totp,
        value: "otpauth://totp/my-example-otp?secret=jncrjgbdjnrncbjsr&issuer=1Password",
      },
    ],
    sections: [
      {
        id: "custom section",
        title: "my section",
      },
    ],
  });

  // Get a one-time password code.
  let element = item.fields.find((element) => {
    return element.field_type == sdk.ItemFieldType.Totp
  })

  if (!element) {
    console.error("no totp field found on item");
    return;
  }

  switch (element.details.type) {
    case 'Otp': {
      if (element.details.content.code) {
        console.log(element.details.content.code)
      } else {
        console.error(element.details.content.error_message)
      }
    }
    default:
  }

  // Edit an item
  item.fields[0].value = "other value";
  let updatedItem = await client.items.put(item);
  console.log(updatedItem.fields);

  // Delete an item
  await client.items.delete(item.vault_id, item.id);
}

manageItems();
fetchSecret().then(console.log);
