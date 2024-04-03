import { Core, InnerClient } from "./core.js";
import { ClientConfiguration, clientAuthConfig } from "./configuration.js";
import { Client } from "./client.js";

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
  core: Core,
): Promise<Client> => {
  const authConfig = clientAuthConfig(config);
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
