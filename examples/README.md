# Examples

This folder contains code snippets that demonstrate how to use the 1Password JS SDK to retrieve a secret from 1Password, using either ES modules or CommonJS modules. 

## Prerequisites

1. Clone the repository.
2. Make sure to export a valid service account token. For example:
	```bash
	export OP_SERVICE_ACCOUNT_TOKEN="<your token>"
	```
	Learn more about [service accounts](https://developer.1password.com/docs/service-accounts/get-started).
3. Run the code in your preferred module format:
	```bash
	npm run esm-example
	```
	```bash
	npm run commonjs-example
	```
