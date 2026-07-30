/* tslint:disable */
/* eslint-disable */
/**
 * Initializes an SDK client with a given configuration.
 */
export function init_client(config: string): Promise<string>;
/**
 * Handles all synchronous invocations to the SDK core received from the SDK.
 */
export function invoke_sync(parameters: string): string;
/**
 * Initializes an SDK client with an OIDC token fetcher.
 * The `fetcher` parameter is a JS function `(string) => Promise<string>`.
 */
export function init_client_oidc(config: string, fetcher: Function): Promise<string>;
/**
 * Drops a client, releasing the memory allocated for it.
 */
export function release_client(client_id: string): void;
/**
 * Handles all asynchronous invocations to the SDK core received from the SDK.
 */
export function invoke(parameters: string): Promise<string>;
