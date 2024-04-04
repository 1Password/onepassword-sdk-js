import { init_client, invoke, release_client } from "@1password/sdk-core";

// Exposes the SDK core to the host JS SDK.
export interface Core {
  // Allocates a new authenticated client and returns its id.
  initClient(config: ClientAuthConfig): Promise<string>;
  // Calls business logic from a given client and returns the result.
  invoke(config: InvokeConfig): Promise<string>;
  // Deallocates memory held by the given client in the SDK core when it goes out of scope.
  releaseClient(clientId: number): void;
}

// Wraps configuration information needed to allocate and authenticate a client instance and sends it to the SDK core.
export interface ClientAuthConfig {
  serviceAccountToken: string;
  programmingLanguage: string;
  sdkVersion: string;
  integrationName: string;
  integrationVersion: string;
  requestLibraryName: string;
  requestLibraryVersion: string;
  os: string;
  osVersion: string;
  architecture: string;
}

// Contains the information sent to the SDK core when you call (invoke) a function.
export interface InvokeConfig {
  // Identifies the client instance for which you called the function.
  clientId: number;
  invocation: Invocation;
}

// Calls certain logic from the SDK core, with the given parameters.
interface Invocation {
  // Functionality name
  name: string;
  // Parameters
  parameters: { [key: string]: unknown };
}

// An implementation of the `Core` interface that shares resources across all clients.
export class SharedCore implements Core {
  public async initClient(config: ClientAuthConfig): Promise<string> {
    const serializedConfig = JSON.stringify(config);
    return init_client(serializedConfig);
  }

  public async invoke(config: InvokeConfig): Promise<string> {
    const serializedConfig = JSON.stringify(config);
    return invoke(serializedConfig);
  }

  public releaseClient(clientId: number): void {
    const serializedId = JSON.stringify(clientId);
    release_client(serializedId);
  }
}

// Represents the client instance on which a call is made.
export interface InnerClient {
  id: number;
  core: Core;
}
