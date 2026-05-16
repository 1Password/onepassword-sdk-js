import { Core } from "./core";
/**
 * SharedLibCore: wrapper around the dynamically loaded shared library
 */
export declare class SharedLibCore implements Core {
    private lib;
    private acccountName;
    constructor(accountName: string);
    /**
     * callSharedLibrary - send string to native function, receive string back.
     */
    private callSharedLibrary;
    initClient(config: string): Promise<string>;
    initClientOidc(config: string, _fetcher: () => Promise<string>): Promise<string>;
    invoke(invokeConfigBytes: string): Promise<string>;
    releaseClient(clientId: string): void;
}
