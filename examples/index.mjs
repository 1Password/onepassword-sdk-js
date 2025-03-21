import * as fs from "fs";

import crypto from "crypto";
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

// [developer-docs.sdk.js.validate-secret-reference]-start
// Validate a secret reference
try {
  sdk.Secrets.validateSecretReference("op://vault/item/field");
} catch (error) {
  console.error(error);
}
// [developer-docs.sdk.js.validate-secret-reference]-end

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
  "op://${item.vaultId}/${item.id}/TOTP_onetimepassword?attribute=totp",
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

// [developer-docs.sdk.js.generate-pin-password]-start
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
// [developer-docs.sdk.js.generate-pin-password]-end

// [developer-docs.sdk.js.generate-memorable-password]-start
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
// [developer-docs.sdk.js.generate-memorable-password]-end

// [developer-docs.sdk.js.generate-random-password]-start
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
// [developer-docs.sdk.js.generate-random-password]-end
shareItem(client, item.vaultId, item.id);
await resolveAllSecrets(client, item.vaultId, item.id, "username", "password");
await createSshKeyItem(client);
await createAndReplaceDocumentItem(client);
await createAndAttachAndDeleteFileFieldItem(client);
// [developer-docs.sdk.js.delete-item]-start
// Delete an item from your vault.
await client.items.delete(item.vaultId, item.id);
// [developer-docs.sdk.js.delete-item]-end

async function shareItem(client, vaultId, itemId) {
  // [developer-docs.sdk.js.item-share-get-item]-start
  let item = await client.items.get(vaultId, itemId);
  console.log(item);
  // [developer-docs.sdk.js.item-share-get-item]-end

  // [developer-docs.sdk.js.item-share-get-account-policy]-start
  let policy = await client.items.shares.getAccountPolicy(
    item.vaultId,
    item.id,
  );
  console.log(policy);
  // [developer-docs.sdk.js.item-share-get-account-policy]-end

  // [developer-docs.sdk.js.item-share-validate-recipients]-start
  let valid_recipients = await client.items.shares.validateRecipients(policy, [
    "helloworld@agilebits.com",
  ]);

  console.log(valid_recipients);
  // [developer-docs.sdk.js.item-share-validate-recipients]-end

  // [developer-docs.sdk.js.item-share-create-share]-start
  let share_link = await client.items.shares.create(item, policy, {
    expireAfter: sdk.ItemShareDuration.OneHour,
    oneTimeOnly: false,
    recipients: valid_recipients,
  });

  console.log(share_link);
  // [developer-docs.sdk.js.item-share-create-share]-end
}
// NOTE: this is in a separate function to avoid creating a new item
// NOTE: just for the sake of archiving it. This is because the SDK
// NOTE: only works with active items, so archiving and then deleting
// NOTE: is not yet possible.
async function archiveItem(vaultId, itemId) {
  // [developer-docs.sdk.js.archive-item]-start
  // Archive an item from your vault.
  await client.items.archive(vaultId, itemId);
  // [developer-docs.sdk.js.archive-item]-end
}

async function createSshKeyItem(client) {
  // [developer-docs.sdk.js.create-sshkey-item]-start
  const privateKey = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096, // 4096-bit key
    privateKeyEncoding: {
      type: "pkcs8", // PKCS#8 Private Key format
      format: "pem",
    },
  });
  // Create a SSH Key Item
  let item = await client.items.create({
    title: "SSH Key Item Created With JS SDK",
    category: sdk.ItemCategory.SshKey,
    vaultId: "7turaasywpymt3jecxoxk5roli",
    fields: [
      {
        id: "private_key",
        title: "private key",
        fieldType: sdk.ItemFieldType.SshKey,
        value: privateKey.privateKey,
        sectionId: "custom section",
      },
    ],
    sections: [
      {
        id: "custom section",
        title: "my section",
      },
    ],
  });
  console.log(item.fields[0].value);
  console.log(item.fields[0].details.content.publicKey);
  console.log(item.fields[0].details.content.fingerprint);
  console.log(item.fields[0].details.content.keyType);
  // [developer-docs.sdk.js.create-sshkey-item]-end
  await client.items.delete(item.vaultId, item.id);
}

async function createAndReplaceDocumentItem(client) {
  // [developer-docs.sdk.js.create-document-item]-start
  // Create a Document Item
  let item = await client.items.create({
    title: "Document Item Created With JS SDK",
    category: sdk.ItemCategory.Document,
    vaultId: "7turaasywpymt3jecxoxk5roli",
    document: {
      name: "file.txt",
      content: new Uint8Array(fs.readFileSync("file.txt")),
    },
  });
  // [developer-docs.sdk.js.create-document-item]-end

  // [developer-docs.sdk.js.replace-document-item]-start
  // Replace the document in the Document Item
  let replacedDocumentItem = await client.items.files.replaceDocument(item, {
    name: "file2.txt",
    content: new Uint8Array(fs.readFileSync("file2.txt")),
  });
  // [developer-docs.sdk.js.replace-document-item]-end

  // [developer-docs.sdk.js.read-document-item]-start
  // Read the content of the Document Item
  let content = await client.items.files.read(
    replacedDocumentItem.vaultId,
    replacedDocumentItem.id,
    replacedDocumentItem.document,
  );
  // [developer-docs.sdk.js.read-document-item]-end

  console.log(new TextDecoder("utf-8").decode(content));

  await client.items.delete(
    replacedDocumentItem.vaultId,
    replacedDocumentItem.id,
  );
}

async function createAndAttachAndDeleteFileFieldItem(client) {
  // [developer-docs.sdk.js.create-item-with-file-field]-start
  // Create the file field item
  let item = await client.items.create({
    title: "Login with File Field Item Created With JS SDK",
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
    ],
    sections: [
      {
        id: "custom section",
        title: "my section",
      },
    ],
    files: [
      {
        name: "file.txt",
        content: new Uint8Array(fs.readFileSync("file.txt")),
        sectionId: "custom section",
        fieldId: "file_field",
      },
    ],
  });
  // [developer-docs.sdk.js.create-item-with-file-field]-end

  // [developer-docs.sdk.js.read-file-field]-start
  // Read the content of the file field on the Item
  let content = await client.items.files.read(
    item.vaultId,
    item.id,
    item.files[0].attributes,
  );
  // [developer-docs.sdk.js.read-file-field]-end

  console.log(new TextDecoder("utf-8").decode(content));

  // [developer-docs.sdk.js.attach-file-field-item]-start
  // Attach a file field to the item
  let attachedItem = await client.items.files.attach(item, {
    name: "file2.txt",
    content: new Uint8Array(fs.readFileSync("file2.txt")),
    sectionId: "custom section",
    fieldId: "new_file_field",
  });
  // [developer-docs.sdk.js.attach-file-field-item]-end

  // [developer-docs.sdk.js.delete-file-field-item]-start
  // Delete a file field from an item
  let deletedItem = await client.items.files.delete(
    attachedItem,
    attachedItem.files[1].sectionId,
    attachedItem.files[1].fieldId,
  );
  // [developer-docs.sdk.js.delete-file-field-item]-end

  console.log(deletedItem.files.length);

  await client.items.delete(deletedItem.vaultId, deletedItem.id);
}

function generateSpecialItemFields() {
  fields: [
    // [developer-docs.sdk.js.address-field-type]-start
    {
      id: "address",
      title: "Address",
      sectionId: "custom section",
      fieldType: sdk.ItemFieldType.Address,
      value: "",
      details: {
        type: "Address",
        content: {
          street: "1234 Elm St",
          city: "Springfield",
          country: "USA",
          zip: "12345",
          state: "IL",
        },
      },
    },
    // [developer-docs.sdk.js.address-field-type]-end
    // [developer-docs.sdk.js.date-field-type]-start
    {
      id: "date",
      title: "Date",
      sectionId: "custom section",
      fieldType: sdk.ItemFieldType.Date,
      value: "1998-03-15",
    },
    // [developer-docs.sdk.js.date-field-type]-end
    // [developer-docs.sdk.js.month-year-field-type]-start
    {
      id: "month_year",
      title: "Month Year",
      sectionId: "custom section",
      fieldType: sdk.ItemFieldType.MonthYear,
      value: "03/1998",
    },
    // [developer-docs.sdk.js.month-year-field-type]-end
    // [developer-docs.sdk.js.reference-field-type]-start
    {
      id: "reference",
      title: "Reference",
      sectionId: "custom section",
      fieldType: sdk.ItemFieldType.Reference,
      value: "f43hnkatjllm5fsfsmgaqdhv7a",
    },
    // [developer-docs.sdk.js.reference-field-type]-end
    // [developer-docs.sdk.js.totp-field-type]-start
    {
      id: "onetimepassword",
      title: "One-Time Password URL",
      sectionId: "custom section",
      fieldType: sdk.ItemFieldType.Totp,
      value:
        "otpauth://totp/my-example-otp?secret=jncrjgbdjnrncbjsr&issuer=1Password",
    },
    // [developer-docs.sdk.js.totp-field-type]-end
  ];
}

async function resolveAllSecrets(client) {
  // [developer-docs.sdk.js.resolve-bulk-secret]-start
  try {
    // Fetch all secrets
    const secrets = await client.secrets.resolveAll([
      "op://7turaasywpymt3jecxoxk5roli/hdvxoumwprditdustkxv7d3dqy/username",
      "op://7turaasywpymt3jecxoxk5roli/hdvxoumwprditdustkxv7d3dqy/password",
    ]);

    for (const [_, response] of Object.entries(secrets.individualResponses)) {
      if (response.error) {
        console.error("Error resolving secret:", response.error);
        continue;
      }

      console.log(response.content.secret);
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  }
  // [developer-docs.sdk.js.resolve-bulk-secret]-end
}
