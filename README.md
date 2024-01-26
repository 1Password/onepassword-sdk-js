# 1Password JavaScript SDK

> ❗ This project is still in its early, pre-alpha stages of development. Its stability is not yet fully assessed, and future iterations may bring backwards incompatible changes. Proceed with caution.

The 1Password JavaScript SDK offers programmatic read-access to your secrets in 1Password in an interface native to JavaScript. The SDK currently supports `Node.JS`.

To use it in your project:

### Get Started

1. [Create a 1Password Service Account](https://developer.1password.com/docs/service-accounts/get-started/#create-a-service-account).

2. Install the JS SDK:

```bash
## NPM
npm install @1password/sdk
```

```bash
## PNPM
pnpm add @1password/sdk
```

```bash
## Yarn
yarn add @1password/sdk
```

3. Use the SDK in your project:

```js
import { createClient } from "@1password/sdk";

// Creates an authenticated client
const client = await createClient({
    auth: "<your_service_account_token>",
    integrationName: "<your_integration_name>",
    integrationVersion: "<your_integration_version>",
});

// Fetches a secret
const secret = await client.secrets.resolve("op://Private/Netflix/website");
```
