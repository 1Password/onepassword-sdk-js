import { Core, InnerClient, SharedCore } from "./core.js";
import { ClientConfiguration, clientAuthConfig } from "./configuration.js";
import { Client } from "./client.js";
import { SharedLibCore } from "./shared_lib_core.js";

const finalizationRegistry = new FinalizationRegistry(
  (heldClient: InnerClient) => {
    heldClient.core.releaseClient(heldClient.id);
  },
);

/**
 * Creates a 1Password SDK client with a given core implementation.
 * @returns The authenticated 1Password SDK client.
 */
export const createClientWithCore = async (
  config: ClientConfiguration,
  core: SharedCore,
): Promise<Client> => {
  const authConfig = clientAuthConfig(config);
  if (authConfig.accountName) {
    core.setInner(new SharedLibCore());
  }
  const clientId = await core.initClient(authConfig);
  const inner: InnerClient = {
    id: parseInt(clientId, 10),
    core,
  };
  const client = new Client(inner);
  // Cleans up associated memory from core when client instance goes out of scope.
  finalizationRegistry.register(client, inner);
  return client;
};
