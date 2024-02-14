/* tslint:disable */
/* eslint-disable */
/**
* Initializes an SDK client with a given configuration.
* @param {string} config
* @returns {Promise<string>}
*/
export function init_client(config: string): Promise<string>;
/**
* Handles all invocations to the SDK core received from the SDK.
* @param {string} parameters
* @returns {Promise<string>}
*/
export function invoke(parameters: string): Promise<string>;
/**
* Drops a client, releasing the memory allocated for it.
* @param {string} client_id
*/
export function release_client(client_id: string): void;
