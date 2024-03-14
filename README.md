# 1Password JavaScript SDK

> ❗ This project is still in its early, pre-alpha stages of development. Its stability is not yet fully assessed, and future iterations may bring backwards incompatible changes. Proceed with caution.

The 1Password JavaScript SDK offers programmatic read access to your secrets in 1Password in an interface native to JavaScript. The SDK currently supports `Node.JS` and authentication with [1Password Service Accounts](https://developer.1password.com/docs/service-accounts/).

### Get started

To use the 1Password JavaScript SDK in your project:

1. [Create a 1Password Service Account](https://developer.1password.com/docs/service-accounts/get-started/#create-a-service-account). Make sure to grant the service account access to the vaults where the secrets your project needs access to are stored.
2. Export your service account token to the `OP_SERVICE_ACCOUNT_TOKEN` environment variable:

```bash
export OP_SERVICE_ACCOUNT_TOKEN=<your-service-account-token>
```

3. Edit your `.npmrc` file (in your $HOME or in your project directory) to include the following: 

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

4. Set the environment variable `NPM_TOKEN` to the private beta token provided by 1Password:

```bash
export NPM_TOKEN=<token-provided-by-1password-on-private-beta-registration>
```

5. Install the 1Password JavaScript SDK:

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

6. Use the SDK in your project:

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

Make sure to use [secret reference URIs](https://developer.1password.com/docs/cli/secret-references/) with the syntax `op://vault/item/field` to securely load secrets from 1Password into your code.
