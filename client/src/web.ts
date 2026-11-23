import init from "@1password/sdk-core/web/core.js";
import wasmModule from "@1password/sdk-core/web/core_bg.wasm";

import { OAuthClient } from "./client.js";
import { OAuthClientConfiguration } from "./configuration.js";
import { InnerClient, SharedCore } from "./core.js";

export * from "./client.js";
export * from "./errors.js";
export * from "./types.js";

const finalizationRegistry = new FinalizationRegistry(
  (heldClient: InnerClient) => {
    heldClient.core.releaseClient(heldClient.id);
  },
);

/**
 * Creates a 1Password OAuth client, authenticated with the credentials returned by the OAuth flow.
 * Only the OAuth client is available on the web; the other clients need Node.
 * @returns The authenticated 1Password OAuth client.
 */
export const createOAuthClient = async (
  config: OAuthClientConfiguration,
): Promise<OAuthClient> => {
  // Loads the core wasm on the first call; the glue returns early once loaded.
  await init(wasmModule);
  const core = new SharedCore();
  const clientId = await core.initClient(config);
  const inner = new InnerClient(parseInt(clientId, 10), core);
  const client = new OAuthClient(inner);
  finalizationRegistry.register(client, inner);
  return client;
};
