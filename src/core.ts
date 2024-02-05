// Exposes the SDK core to the host JS SDK.
export interface Core {
  // Allocates a new authenticated client and returns its id.
  initClient(config: ClientAuthConfig): Promise<string>;
  // Calls business logic from a given client and returns the result.
  invoke(config: InvokeConfig): Promise<string>;
  // Deallocates memory held by the given client in the SDK core when it goes out of scope.
  releaseClient(clientId: number): Promise<void>;
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
  parameters: string;
}

// An implementation of the `Core` interface that shares resources across all clients.
export class SharedCore implements Core {
  async initClient(config: ClientAuthConfig): Promise<string> {
    return "";
  }

  async invoke(config: InvokeConfig): Promise<string> {
    return "";
  }

  async releaseClient(clientId: number): Promise<void> {}
}
