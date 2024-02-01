/* tslint:disable */
/* eslint-disable */
/**
* @param {string} config
* @returns {string}
*/
export function init_client(config: string): string;
/**
* Handles all invocations to the SDK core received from the SDK.
* @param {string} parameters
* @returns {string}
*/
export function invoke(parameters: string): string;
/**
* Drops a client, releasing the memory allocated for it.
* @param {bigint} client_id
*/
export function release_client(client_id: bigint): void;
