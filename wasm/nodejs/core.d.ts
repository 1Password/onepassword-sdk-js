/* tslint:disable */
/* eslint-disable */
export function start(): void;
/**
 * Initializes an SDK client with a given configuration.
 */
export function init_client(config: string): Promise<string>;
/**
 * Initializes an SDK client with an OIDC token fetcher.
 * The `fetcher` parameter is a JS function `() => Promise<string>`.
 */
export function init_client_oidc(config: string, fetcher: Function): Promise<string>;
/**
 * Handles all asynchronous invocations to the SDK core received from the SDK.
 */
export function invoke(parameters: string): Promise<string>;
/**
 * Handles all synchronous invocations to the SDK core received from the SDK.
 */
export function invoke_sync(parameters: string): string;
/**
 * Drops a client, releasing the memory allocated for it.
 */
export function release_client(client_id: string): void;
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */
type ReadableStreamType = "bytes";
export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  start(controller: ReadableByteStreamController): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  cancel(): void;
  readonly type: ReadableStreamType;
  readonly autoAllocateChunkSize: number;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  write(chunk: any): Promise<any>;
  close(): Promise<any>;
  abort(reason: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}
