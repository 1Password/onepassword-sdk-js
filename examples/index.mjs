import sdk from "@1password/sdk";

// Creates an authenticated client.
const client = await sdk.createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
  // Set the following to your own integration name and version.
  integrationName: "My 1Password Integration",
  integrationVersion: "v1.0.0",
});

// Fetches a secret.
const secret = await client.secrets.resolve("op://vault/item/field");
console.log(secret);

// Creates an item
let item = await client.items.create({
  title: "My Item",
  category: sdk.ItemCategory.Login,
  vault_id: "xw33qlvug6moegr3wkk5zkenoa",
  fields: [
    {
      id: "username",
      title: "username",
      field_type: sdk.ItemFieldType.Text,
      value: "my username",
    },
    {
      id: "custom",
      title: "my custom field",
      section_id: "custom section",
      field_type: sdk.ItemFieldType.Concealed,
      value: "my secret value",
    },
  ],
  sections: [
    {
      id: "custom section",
      title: "my section",
    },
  ],
});

// Edits an item
item.fields[0].value = "other value";
let updatedItem = await client.items.put(item);

console.log(updatedItem.fields);

// Deletes an item
await client.items.delete(item.vault_id, item.id);
