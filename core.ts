// Core exposes the WASM core interface to host JS SDK.
export interface Core {
  // initClient allocates a new authenticated client and returns its id.
  initClient(config: ClientAuthConfig): Promise<string>;
  // invoke calls business logic from a given client and returns the result.
  invoke(config: Invocation): Promise<string>;
  // releaseClient is called for deallocating WASM memory held by the given client in the WASM core when it goes out of scope.
  releaseClient(clientId: number): void;
}

// ClientAuthConfig is sent to the WASM core for allocating and authenticating a client instance.
export interface ClientAuthConfig {
  saToken: string;
  language: string;
  sdkVersion: string;
  integrationName: string;
  integrationVersion: string;
  requestLibraryName: string;
  requestLibraryVersion: string;
  os: string;
  osVersion: string;
  arch: string;
}

// Invocation is sent to the WASM core for calling certain logic, with the given parameters.
export interface Invocation {
  // The client ID on which this functionality is invoked
  client: number;
  // Functionality name
  name: string;
  // Parameters
  data: string;
}

export class TestCore implements Core {
  async initClient(config: ClientAuthConfig): Promise<string> {
    return "1";
  }

  async invoke(config: Invocation): Promise<string> {
    return "secret";
  }

  async releaseClient(clientId: number) {}
}
