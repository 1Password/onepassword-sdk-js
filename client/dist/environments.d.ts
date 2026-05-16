import { InnerClient } from "./core.js";
import { GetVariablesResponse } from "./types.js";
/**
 * The Environments API holds all the operations the SDK client can perform on 1Password Environments.
 */
export interface EnvironmentsApi {
    /**
     * Get environment variables belonging to an Environment.
     */
    getVariables(environmentId: string): Promise<GetVariablesResponse>;
}
export declare class Environments implements EnvironmentsApi {
    #private;
    constructor(inner: InnerClient);
    /**
     * Get environment variables belonging to an Environment.
     */
    getVariables(environmentId: string): Promise<GetVariablesResponse>;
}
