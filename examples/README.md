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
