// [developer-docs.sdk.js/es-modules.sdk-import]-start
import sdk from "@1password/sdk";
// [developer-docs.sdk.js/es-modules.sdk-import]-end

// [developer-docs.sdk.js.client-initialization]-start
// Creates an authenticated client.
const client = await sdk.createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
  // Set the following to your own integration name and version.
  integrationName: "My 1Password Integration",
  integrationVersion: "v1.0.0",
});
// [developer-docs.sdk.js.client-initialization]-end

// [developer-docs.sdk.js.list-vaults]-start
const vaults = await client.vaults.listAll();
for await (const vault of vaults) {
  console.log(vault.id + " " + vault.title);
}
// [developer-docs.sdk.js.list-vaults]-end

// [developer-docs.sdk.js.list-items]-start
const items = await client.items.listAll("7turaasywpymt3jecxoxk5roli");
for await (const item of items) {
  console.log(item.id + " " + item.title);
}
// [developer-docs.sdk.js.list-items]-end

// [developer-docs.sdk.js.resolve-secret]-start
// Fetches a secret.
const secret = await client.secrets.resolve("op://vault/item/field");
console.log(secret);
// [developer-docs.sdk.js.resolve-secret]-end

// [developer-docs.sdk.js.create-item]-start
// Creates an item
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
// [developer-docs.sdk.js.create-item]-end

// [developer-docs.sdk.js.resolve-totp-code]-start
// Fetches a TOTP code.
const code = await client.secrets.resolve(
  `op://${item.vaultId}/${item.id}/TOTP_onetimepassword?attribute=totp`,
);
console.log(code);
// [developer-docs.sdk.js.resolve-totp-code]-end

// [developer-docs.sdk.js.get-totp-item-crud]-start
// Get a one-time password code.
let element = item.fields.find((element) => {
  return element.fieldType == sdk.ItemFieldType.Totp;
});

if (!element) {
  console.error("no totp field found on item");
} else {
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
}
// [developer-docs.sdk.js.get-totp-item-crud]-end

// [developer-docs.sdk.js.get-item]-start
let retrievedItem = await client.items.get(item.vaultId, item.id);
// [developer-docs.sdk.js.get-item]-end

// [developer-docs.sdk.js.update-item]-start
// Edit an item (change the password)
let newItem = {
  ...retrievedItem,
  fields: retrievedItem.fields.map((f) => {
    if (f.title == "password") {
      return { ...f, value: "my-new-password" };
    } else {
      return f;
    }
  }),
};
let updatedItem = await client.items.put(newItem);
// [developer-docs.sdk.js.update-item]-end

console.log(updatedItem.fields);

pinPassword = sdk.Secrets.generatePassword({
  type: "Pin",
  parameters: {
    length: 8,
  },
});

console.log(pinPassword);

memorablePassword = sdk.Secrets.generatePassword({
  type: "Memorable",
  parameters: {
    separatorType: sdk.SeparatorType.Digits,
    capitalize: true,
    wordListType: sdk.WordListType.FullWords,
    wordCount: 8,
  },
});
console.log(memorablePassword);

randomPassword = sdk.Secrets.generatePassword({
  type: "Random",
  parameters: {
    includeDigits: true,
    includeSymbols: true,
    length: 8,
  },
});
console.log(randomPassword);

// [developer-docs.sdk.js.delete-item]-start
// Deletes an item
await client.items.delete(item.vaultId, item.id);
// [developer-docs.sdk.js.delete-item]-end
