# Examples

This folder contains code snippets showing how to import and use the 
1Password JS SDK, using either ES Modules or CommonJS modules.

### How to run
1. Clone this repo
2. Install dependencies and build the client:
    ```bash
    cd client && npm i && npm run build
    ```
3. Install example dependencies:
    ```bash
    cd examples && npm i
    ```
4. Run the code in your preferred module format. First make sure to use a valid Service Account token:
    ```bash
    npm run esm-example
    ```
   ```bash
   npm run commonjs-example
    ```
