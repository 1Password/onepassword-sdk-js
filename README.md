# 1Password JavaScript SDK

> ❗ This project is still in its early, pre-alpha stages of development. Its stability is not yet fully assessed, and future iterations may bring backwards incompatible changes. Proceed with caution.

The 1Password JavaScript SDK offers programmatic read access to your secrets in 1Password in an interface native to JavaScript. The SDK currently supports `Node.JS` and authentication with [1Password Service Accounts](https://developer.1password.com/docs/service-accounts/).

### Get started

To use the 1Password JavaScript SDK in your project:

1. If you're a 1Password account owner or admin, you can go ahead and [create a 1Password Service Account](https://my.1password.com/developer-tools/infrastructure-secrets/serviceaccount/), otherwise you need to ask your 1Password administrator for a token. [Read more about getting started with service accounts](https://developer.1password.com/docs/service-accounts/get-started/#create-a-service-account).
2. Export your service account token to the `OP_SERVICE_ACCOUNT_TOKEN` environment variable:

```bash
export OP_SERVICE_ACCOUNT_TOKEN=<your-service-account-token>
```

3. Set the environment variable `NPM_TOKEN` to the private beta token provided by 1Password:

```bash
export NPM_TOKEN=<token-provided-by-1password-on-private-beta-registration>
```

4. Install the 1Password JavaScript SDK:

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

5. Use the SDK in your project:

```js
import { createClient } from "@1password/sdk";

// Creates an authenticated client.
const client = await createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN,
    integrationName: "<your_integration_name>",
    integrationVersion: "<your_integration_version>",
});

// Fetches a secret.
const secret = await client.secrets.resolve("op://vault/item/field");
```

Make sure to use [secret reference URIs](https://developer.1password.com/docs/cli/secret-references/) with the syntax `op://vault/item/field` to securely load secrets from 1Password into your code. Note: We don't yet support secret reference-based retrieval of files and SSH Keys and we don't support secret reference query params.
