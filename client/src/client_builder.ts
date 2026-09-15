import { InnerClient, StandardClient, SharedCore } from "./core.js";
import {
  ClientConfiguration,
  OAuthClientConfiguration,
  WorkloadClientConfiguration,
  clientAuthConfig,
} from "./configuration.js";
import { Client, WorkloadClient } from "./client.js";
import { SharedLibCore } from "./shared_lib_core.js";

const isOAuthClientConfiguration = (
  config: WorkloadClientConfiguration | OAuthClientConfiguration,
): config is OAuthClientConfiguration =>
  "accessToken" in config || "integrationKey" in config;

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
 * Creates a 1Password broker client authenticated as either a workload or an
 * OAuth integration, with a given core implementation.
 * @returns The authenticated 1Password broker client.
 */
export const createWorkloadClientWithCore = async (
  config: WorkloadClientConfiguration | OAuthClientConfiguration,
  core: SharedCore,
): Promise<WorkloadClient> => {
  // ClientConfig is untagged in the Rust core. Passing only integrationKey and
  // accessToken to init_client selects its ClientConfig::Oauth variant.
  const clientId = isOAuthClientConfiguration(config)
    ? await core.initClient(config)
    : await core.initClientOidc(config, config.oidcFetcher);
  const inner = new InnerClient(parseInt(clientId, 10), core);
  const client = new WorkloadClient(inner);
  // Cleans up associated memory from core when client instance goes out of scope.
  finalizationRegistry.register(client, inner);
  return client;
};
