import { InnerClient, StandardClient, SharedCore } from "./core.js";
import {
  ClientConfiguration,
  OAuthClientConfiguration,
  WorkloadClientConfiguration,
  clientAuthConfig,
} from "./configuration.js";
import { Client, OAuthClient, WorkloadClient } from "./client.js";
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
    core.setInner(new SharedLibCore(authConfig.accountName));
  }
  const clientId = await core.initClient(authConfig);
  const inner = new StandardClient(parseInt(clientId, 10), core, authConfig);
  const client = new Client(inner);
  // Cleans up associated memory from core when client instance goes out of scope.
  finalizationRegistry.register(client, inner);
  return client;
};

/**
 * Creates a 1Password workload client with a given core implementation.
 * @returns The authenticated 1Password workload client.
 */
export const createWorkloadClientWithCore = async (
  config: WorkloadClientConfiguration,
  core: SharedCore,
): Promise<WorkloadClient> => {
  const clientId = await core.initClientOidc(config, config.oidcFetcher);
  const inner = new InnerClient(parseInt(clientId, 10), core);
  const client = new WorkloadClient(inner);
  // Cleans up associated memory from core when client instance goes out of scope.
  finalizationRegistry.register(client, inner);
  return client;
};

/**
 * Creates a 1Password OAuth client with a given core implementation.
 * @returns The authenticated 1Password OAuth client.
 */
export const createOAuthClientWithCore = async (
  config: OAuthClientConfiguration,
  core: SharedCore,
): Promise<OAuthClient> => {
  // ClientConfig is untagged in the Rust core. Passing only integrationKey and
  // accessToken to init_client selects its ClientConfig::Oauth variant.
  const clientId = await core.initClient(config);
  const inner = new InnerClient(parseInt(clientId, 10), core);
  const client = new OAuthClient(inner);
  // Cleans up associated memory from core when client instance goes out of scope.
  finalizationRegistry.register(client, inner);
  return client;
};
