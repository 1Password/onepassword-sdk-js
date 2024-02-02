import { init_client, invoke, release_client } from "./js-core/core.js";

// `Core` exposes the WASM core interface to the host JS SDK.
export interface Core {
  // initClient allocates a new authenticated client and returns its id.
  initClient(config: ClientAuthConfig): Promise<string>;
  // invoke calls business logic from a given client and returns the result.
  invoke(config: InvokeConfig): Promise<string>;
  // `releaseClient` deallocates WASM memory held by the given client in the WASM core when it goes out of scope.
  releaseClient(clientId: number): void;
}

// `ClientAuthConfig` wraps configuration information needed to allocate and authenticate a client instance. It's sent to the WASM core.
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

// `InvokeConfig` contains the information sent to the SDK core when you call (invoke) a function.
export interface InvokeConfig {
  // `clientID` identifies the client instance for which you called the function.
  clientId: number;
  invocation: Invocation;
}

// `Invocation` calls certain logic from the WASM core, with the given parameters.
interface Invocation {
  // Functionality name
  name: string;
  // Parameters
  parameters: string;
}

// SharedCore is an implementation of the Core interface that shares resources across all clients.
export class SharedCore implements Core {
  async initClient(config: ClientAuthConfig): Promise<string> {
    const serializedConfig = JSON.stringify(config);
    return await init_client(serializedConfig);
  }

  async invoke(config: InvokeConfig): Promise<string> {
    const serializedConfig = JSON.stringify(config);
    return await invoke(serializedConfig);
  }

  releaseClient(clientId: number): void {
    release_client(BigInt(clientId));
  }
}
