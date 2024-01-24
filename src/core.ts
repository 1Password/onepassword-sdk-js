// Core exposes the WASM core interface to host JS SDK.
export interface Core {
  // initClient allocates a new authenticated client and returns its id.
  initClient(config: ClientAuthConfig): Promise<string>;
  // invoke calls business logic from a given client and returns the result.
  invoke(config: InvokeConfig): Promise<string>;
  // releaseClient is called for deallocating WASM memory held by the given client in the WASM core when it goes out of scope.
  releaseClient(clientId: number): Promise<void>;
}

// ClientAuthConfig is sent to the WASM core for allocating and authenticating a client instance.
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

// InvokeConfig is the information being sent to the sdk core upon a function call.
export interface InvokeConfig {
  // The client ID on which this functionality is invoked
  clientId: number;
  invocation: Invocation;
}

// Invocation is sent to the WASM core for calling certain logic, with the given parameters.
interface Invocation {
  // Functionality name
  name: string;
  // Parameters
  parameters: string;
}

// SharedCore is an implementation of the Core interface whose resources will be shared across all clients.
export class SharedCore implements Core {
  async initClient(config: ClientAuthConfig): Promise<string> {
    return "";
  }

  async invoke(config: InvokeConfig): Promise<string> {
    return "";
  }

  async releaseClient(clientId: number): Promise<void> {}
}
