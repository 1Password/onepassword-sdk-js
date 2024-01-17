# 1Password JavaScript SDK

> ❗ This project is still in its early, pre-alpha stages of development. Its stability is not yet fully assessed, and future iterations may bring backwards incompatible changes. Proceed with caution.

The 1Password JavaScript SDK offers programmatic read-access to your secrets in 1Password in an interface native to JavaScript. To use it in your project:

1. [Create a 1Password Service Account](https://developer.1password.com/docs/service-accounts/get-started/#create-a-service-account).

2. Install the JS SDK:

```bash
## NPM
npm install @1password/sdk

## PNPM
pnpm add @1password/sdk

## Yarn
yarn add @1password/sdk
```

5. Use the SDK in your project:

```js
async function main() {
    let client = await new Client(
        new ClientConfiguration(
            new ServiceAccountAuth(
                "<your_token>",
            ),
            new IntegrationInformation("Terraform app", "v1"),
        ),
    ).authenticate();

    client.secrets.resolve("op://vault/item/field").then(console.log);
}

main();
```

### Compatibility
- NodeJS
- Browsers

