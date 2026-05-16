import { ClientAuthConfig, WorkloadDetails } from "./core.js";
export declare const LANGUAGE = "JS";
export declare const VERSION = "0040003";
export interface ClientConfiguration {
    auth?: Auth;
    integrationName: string;
    integrationVersion: string;
    oidcFetcher?: () => Promise<string>;
    workloadDetails?: WorkloadDetails;
}
type Auth = string | DesktopAuth;
/**
 * Setting that specifies a client should use the desktop app to authenticate. Set accountName to your 1Password account name as shown at the top left sidebar of the app, or your account UUID.
 */
export declare class DesktopAuth {
    accountName: string;
    constructor(accountName: string);
}
/**
 * Creates a default client configuration.
 * @returns The client configuration to instantiate the client with.
 */
export declare const clientAuthConfig: (userConfig: ClientConfiguration) => ClientAuthConfig;
export declare const getOsName: () => string;
export {};
