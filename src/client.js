import { SecretsSource } from "./secrets.js";
import { SharedCore } from "./core.js";
import * as os from "os";
export const DEFAULT_INTEGRATION_NAME = "Unknown";
export const DEFAULT_INTEGRATION_VERSION = "Unknown";
const LANGUAGE = "JS";
const VERSION = "0010001"; // v0.1.0
const finalizationRegistry = new FinalizationRegistry((heldClientId) => {
    const sharedCore = new SharedCore();
    sharedCore.releaseClient(heldClientId);
});
export async function createClient(config) {
    return createClientWithCore(config, new SharedCore());
}
export async function createClientWithCore(config, core) {
    const authConfig = createClientAuthConfig(config);
    const clientID = await core.initClient(authConfig);
    const inner = {
        id: parseInt(clientID),
        core: core,
    };
    const client = new Client(inner);
    // cleanup associated memory from core when client instance goes out of scope
    finalizationRegistry.register(client, inner.id);
    return client;
}
// Client represents a client instance of the SDK.
export class Client {
    constructor(innerClient) {
        this.secrets = new SecretsSource(innerClient);
    }
}
export function createClientAuthConfig(userConfig) {
    return {
        serviceAccountToken: userConfig.auth,
        programmingLanguage: LANGUAGE,
        sdkVersion: VERSION,
        integrationName: userConfig.integrationName,
        integrationVersion: userConfig.integrationVersion,
        requestLibraryName: "TBD",
        requestLibraryVersion: "TBD",
        // Only supported on Node.js
        os: os.type(),
        osVersion: os.version(),
        architecture: os.arch(),
    };
}
