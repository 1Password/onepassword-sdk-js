import * as os from "os";
import { ClientAuthConfig, Core, SharedCore } from "./core.js";
import { ClientConfiguration, InnerClient } from "./configuration.js";
import { Client } from "./client.js";

export const DEFAULT_INTEGRATION_NAME = "Unknown";
export const DEFAULT_INTEGRATION_VERSION = "Unknown";

const LANGUAGE = "JS";
const VERSION = "0010001"; // v0.1.0

const finalizationRegistry = new FinalizationRegistry(
  (heldClient: InnerClient) => {
    heldClient.core.releaseClient(heldClient.id);
  },
);

/**
 * Creates a default 1Password SDK client.
 * @returns The authenticated 1Password SDK client.
 */
export const createClient = async (
  config: ClientConfiguration,
): Promise<Client> => createClientWithCore(config, new SharedCore());

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

/**
 * Creates a default client configuration.
 * @returns The client configuration to instantiate the client with.
 */
export const clientAuthConfig = (
  userConfig: ClientConfiguration,
): ClientAuthConfig => {
  // TODO: Add logic for computing the correct sanitized version value for each platform
  const defaultOsVersion = "0.0.0";
  return {
    serviceAccountToken: userConfig.auth,
    programmingLanguage: LANGUAGE,
    sdkVersion: VERSION,
    integrationName: userConfig.integrationName,
    integrationVersion: userConfig.integrationVersion,
    requestLibraryName: "Fetch API",
    requestLibraryVersion: "Fetch API",
    // Only supported on Node.js
    os: os.type().toLowerCase(),
    osVersion: defaultOsVersion,
    architecture: os.arch(),
  };
};
