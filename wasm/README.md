# @1password/sdk-core (WASM)

This package is the 1Password SDK core built to WebAssembly for Node.js. The client and examples depend on it.

## Seeing WASM / Rust logs

WASM only prints to the console when the binary was **built with the `internal` Cargo feature**. The JS glue in `nodejs/core.js` already forwards `log`/`warn` to `console.log`/`console.warn`; if you see no output, the WASM you’re running was built without logging.

**To get logs:**

1. Use the **sdk-core** repo (parent of this repo), not only this JS repo.
2. From the **sdk-core** root, run:
   ```bash
   make local/js-internal
   ```
   That builds the Rust core with `--features internal,public-beta`, enables the Rust `log` crate and forwards it to the JS `console`, then copies the built artifacts into this repo’s `wasm/nodejs/`.
3. Run your app from **this** repo (e.g. `npm run commonjs-example` from the onepassword-sdk-js root). Logs from the WASM will appear in the same place as your other `console` output (Node: terminal; browser: DevTools).

**If you still see no WASM logs:**

- **Wrong WASM** – The repo might still have a WASM from a normal (non-internal) build or from npm. After `make local/js-internal`, confirm that the files in `wasm/nodejs/` (including `core_bg.wasm`) were updated.
- **Wrong console** – If the SDK runs inside a Web Worker or another context, that context has its own `console`; you need to look at that environment's console or forward logs from it (e.g. `postMessage` to the main thread and log there).

No log callback or host function is required in the JS repo; when the internal WASM is used, it already prints via the environment's `console`.

**After `make local/js-internal`:** The generator may output `core.js` with `require('env')` and no `env.__getrandom_v03_custom`. This repo's `core.js` is patched to fix that. If you run the make target again, re-apply those patches so the example runs in Node.
