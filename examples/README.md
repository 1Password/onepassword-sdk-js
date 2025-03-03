# Examples

This folder contains code snippets showing how to import and use the
1Password JS SDK, using either ES Modules or CommonJS modules.

### How to run
1. Clone this repo
2. Make sure to export a valid service account token. For example:
	```bash
	export OP_SERVICE_ACCOUNT_TOKEN="<your token>"
	```
3. Make sure to export a valid vault uuid. For example:
    ```bash
    export OP_VAULT_ID="<your vault uuid>"
    ```
4. Run the code in your preferred module format.
    ```bash
    npm run esm-example
    ```
    ```bash
    npm run commonjs-example
    ```
# Examples
This folder contains a code snippet demonstrating how to use the 1Password Python SDK for performing various operations on 1Password vaults and items. Specifically, the example showcases how to:

- Authenticate with the 1Password API using a service account token.
- List available vaults and items within those vaults.
- Retrieve a specific secret and resolve a one-time password (TOTP).
- Create a new item in a vault with multiple fields and tags.
- Update an existing item by modifying its fields and adding a new website.
- Generate different types of passwords (PIN, memorable, and random).
- Share an item with valid recipients and create a shareable link.
- Archive or delete items from the vault.

## Prerequisites

1. Clone the repository and follow the steps to [get started](https://github.com/1Password/onepassword-sdk-js/blob/main/README.md).
2. Ensure that you have a valid service account token by exporting it as an environment variable:
    ```bash
    export OP_SERVICE_ACCOUNT_TOKEN="<your token>"
    ```
3. Export the vault UUID you wish to interact with as an environment variable:
    ```bash
    export OP_VAULT_ID="<your vault uuid>"
    ```

## How to Run

To run the example file, navigate to project root directory run the code in your preferred module format.
    ```bash
    npm run esm-example
    ```
    ```bash
    npm run commonjs-example
    ```

## Terminal Output

When running the example, the terminal will display:

- A list of vaults and items.
- Retrieved secrets and TOTP codes.
- Details of newly created and updated items.
- Generated passwords (PIN, memorable, random).
- A shareable link for shared items.

These outputs show the results of vault and item operations, password generation, and sharing.
