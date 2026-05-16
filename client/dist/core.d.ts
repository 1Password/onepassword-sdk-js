/**
 *  Exposes the SDK core to the host JS SDK.
 */
export interface Core {
    /**
     *  Allocates a new authenticated client and returns its id.
     */
    initClient(config: string): Promise<string>;
    /**
     *  Allocates a new authenticated client using an OIDC token fetcher and returns its id.
     */
    initClientOidc(config: string, fetcher: () => Promise<string>): Promise<string>;
    /**
     *  Calls async business logic from a given client and returns the result.
     */
    invoke(config: string): Promise<string>;
    /**
     *  Deallocates memory held by the given client in the SDK core when it goes out of scope.
     */
    releaseClient(clientId: string): void;
}
/**
 *  Wraps configuration information needed to allocate and authenticate a client instance and sends it to the SDK core.
 */
export interface ClientAuthConfig {
    programmingLanguage: string;
    sdkVersion: string;
    integrationName: string;
    integrationVersion: string;
    requestLibraryName: string;
    requestLibraryVersion: string;
    os: string;
    osVersion: string;
    architecture: string;
    serviceAccountToken?: string;
    accountName?: string;
    workloadDetails?: WorkloadDetails;
}
/**
 *  Contains workload authentication details for OIDC-based workload identity.
 */
export interface WorkloadDetails {
    customerManagedSecret: string;
    workloadUuid: string;
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
    parameters: {
        [key: string]: unknown;
    };
}
export declare class WasmCore implements Core {
    initClient(config: string): Promise<string>;
    initClientOidc(config: string, fetcher: () => Promise<string>): Promise<string>;
    invoke(config: string): Promise<string>;
    releaseClient(clientId: string): void;
}
/**
 *  An implementation of the `Core` interface that shares resources across all clients.
 */
export declare class SharedCore {
    private inner;
    constructor();
    setInner(core: Core): void;
    initClient(config: ClientAuthConfig): Promise<string>;
    initClientOidc(config: ClientAuthConfig, fetcher: () => Promise<string>): Promise<string>;
    invoke(config: InvokeConfig): Promise<string>;
    invoke_sync(config: InvokeConfig): string;
    releaseClient(clientId: number): void;
}
/**
 *  Represents the client instance on which a call is made.
 */
export declare class InnerClient {
    id: number;
    readonly core: SharedCore;
    config: ClientAuthConfig;
    constructor(id: number, core: SharedCore, config: ClientAuthConfig);
    invoke(config: InvokeConfig): Promise<string>;
}
export {};
