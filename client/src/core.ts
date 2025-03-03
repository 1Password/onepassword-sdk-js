import {
  init_client,
  invoke,
  invoke_sync,
  release_client,
} from "@1password/sdk-core";

import { ReplacerFunc } from "./types";
import { throwError } from "./errors";

// In empirical tests, we determined that maximum message size that can cross the FFI boundary 
// is ~64MB. Past this limit, the wasm-bingen FFI will throw an error and the program will crash.
// We set the limit to 50MB to be safe, to be reconsidered upon further testing.
const messageLimit = 50 * 1024 * 1024; 

/**
 *  Exposes the SDK core to the host JS SDK.
 */
export interface Core {
  /**
   *  Allocates a new authenticated client and returns its id.
   */
  initClient(config: ClientAuthConfig): Promise<string>;
  /**
   *  Calls async business logic from a given client and returns the result.
   */
  invoke(config: InvokeConfig): Promise<string>;
  /**
   *  Calls sync business logic from a given client and returns the result.
   */
  invoke_sync(config: InvokeConfig): string;
  /**
   *  Deallocates memory held by the given client in the SDK core when it goes out of scope.
   */
  releaseClient(clientId: number): void;
}

/**
 *  Wraps configuration information needed to allocate and authenticate a client instance and sends it to the SDK core.
 */
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

/**
 *  Contains the information sent to the SDK core when you call (invoke) a function.
 */
export interface InvokeConfig {
  /**
   *  Identifies the client instance for which you called the function.
   */
  invocation: Invocation;
}

/**
 *  Calls certain logic from the SDK core, with the given parameters.
 */
interface Invocation {
  /**
   *  Identifies the client instance for which you called the function.
   */
  clientId?: number;

  parameters: Parameters;
}
export interface Parameters {
  /**
   *  Functionality name
   */
  name: string;
  /**
   *  Parameters
   */
  parameters: { [key: string]: unknown };
}

/**
 *  An implementation of the `Core` interface that shares resources across all clients.
 */
export class SharedCore implements Core {
  public async initClient(config: ClientAuthConfig): Promise<string> {
    const serializedConfig = JSON.stringify(config);
    try {
      return await init_client(serializedConfig);
    } catch (e) {
      throwError(e as string);
    }
  }

  public async invoke(config: InvokeConfig): Promise<string> {
    const serializedConfig = JSON.stringify(config, ReplacerFunc);
    // Encoding to bytes as JS uses UTF-16 under the hood, but the messages
    // that are sent across the FFI boundary are encoded in UTF-8.
    if (new TextEncoder().encode(serializedConfig).length > messageLimit) {
      throwError(`message size exceeds the limit maximum of ${messageLimit} bytes`);
    }
    try {
      return await invoke(serializedConfig);
    } catch (e) {
      throwError(e as string);
    }
  }

  public invoke_sync(config: InvokeConfig): string {
    const serializedConfig = JSON.stringify(config, ReplacerFunc);
    // Encoding to bytes as JS uses UTF-16 under the hood, but the messages
    // that are sent across the FFI boundary are encoded in UTF-8.
    if (new TextEncoder().encode(serializedConfig).length > messageLimit) {
      throwError(`message size exceeds the limit maximum of ${messageLimit} bytes`);
    }
    try {
      return invoke_sync(serializedConfig);
    } catch (e) {
      throwError(e as string);
    }
  }
  
  public releaseClient(clientId: number): void {
    const serializedId = JSON.stringify(clientId);
    release_client(serializedId);
  }
}

/**
 *  Represents the client instance on which a call is made.
 */
export interface InnerClient {
  id: number;
  core: Core;
}
