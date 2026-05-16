"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnerClient = exports.SharedCore = exports.WasmCore = void 0;
const sdk_core_1 = require("@1password/sdk-core");
const types_1 = require("./types");
const errors_1 = require("./errors");
// In empirical tests, we determined that maximum message size that can cross the FFI boundary
// is ~64MB. Past this limit, the wasm-bingen FFI will throw an error and the program will crash.
// We set the limit to 50MB to be safe, to be reconsidered upon further testing.
const messageLimit = 50 * 1024 * 1024;
class WasmCore {
    initClient(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, sdk_core_1.init_client)(config);
            }
            catch (e) {
                (0, errors_1.throwError)(e);
            }
        });
    }
    initClientOidc(config, fetcher) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, sdk_core_1.init_client_oidc)(config, fetcher);
            }
            catch (e) {
                (0, errors_1.throwError)(e);
            }
        });
    }
    invoke(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, sdk_core_1.invoke)(config);
            }
            catch (e) {
                (0, errors_1.throwError)(e);
            }
        });
    }
    releaseClient(clientId) {
        try {
            (0, sdk_core_1.release_client)(clientId);
        }
        catch (e) {
            console.warn("failed to release client:", e);
        }
    }
}
exports.WasmCore = WasmCore;
/**
 *  An implementation of the `Core` interface that shares resources across all clients.
 */
class SharedCore {
    constructor() {
        this.inner = new WasmCore();
    }
    setInner(core) {
        this.inner = core;
    }
    initClient(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const serializedConfig = JSON.stringify(config);
            return this.inner.initClient(serializedConfig);
        });
    }
    initClientOidc(config, fetcher) {
        return __awaiter(this, void 0, void 0, function* () {
            const serializedConfig = JSON.stringify(config);
            return this.inner.initClientOidc(serializedConfig, fetcher);
        });
    }
    invoke(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const serializedConfig = JSON.stringify(config, types_1.ReplacerFunc);
            // Encoding to bytes as JS uses UTF-16 under the hood, but the messages
            // that are sent across the FFI boundary are encoded in UTF-8.
            if (new TextEncoder().encode(serializedConfig).length > messageLimit) {
                (0, errors_1.throwError)(`message size exceeds the limit of ${messageLimit} bytes, please contact 1Password at support@1password.com or https://developer.1password.com/joinslack if you need help."`);
            }
            return this.inner.invoke(serializedConfig);
        });
    }
    invoke_sync(config) {
        const serializedConfig = JSON.stringify(config, types_1.ReplacerFunc);
        // Encoding to bytes as JS uses UTF-16 under the hood, but the messages
        // that are sent across the FFI boundary are encoded in UTF-8.
        if (new TextEncoder().encode(serializedConfig).length > messageLimit) {
            (0, errors_1.throwError)(`message size exceeds the limit of ${messageLimit} bytes, please contact 1Password at support@1password.com or https://developer.1password.com/joinslack if you need help.`);
        }
        return (0, sdk_core_1.invoke_sync)(serializedConfig);
    }
    releaseClient(clientId) {
        const serializedId = JSON.stringify(clientId);
        this.inner.releaseClient(serializedId);
    }
}
exports.SharedCore = SharedCore;
/**
 *  Represents the client instance on which a call is made.
 */
class InnerClient {
    constructor(id, core, config) {
        this.id = id;
        this.core = core;
        this.config = config;
    }
    invoke(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.core.invoke(config);
            }
            catch (err) {
                if (err instanceof errors_1.DesktopSessionExpiredError) {
                    const newId = yield this.core.initClient(this.config);
                    this.id = parseInt(newId, 10);
                    config.invocation.clientId = this.id;
                    return yield this.core.invoke(config);
                }
                throw err;
            }
        });
    }
}
exports.InnerClient = InnerClient;
