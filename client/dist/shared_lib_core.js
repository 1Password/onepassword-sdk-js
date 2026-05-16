"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.SharedLibCore = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const errors_1 = require("./errors");
/**
 * Find the 1Password shared lib path by asking an the wasm core synchronously.
 */
const find1PasswordLibPath = () => {
    const platform = os.platform();
    const appRoot = path.dirname(process.execPath);
    let searchPaths = [];
    // Define lists of possible locations for each platform.
    switch (platform) {
        case "darwin": // macOS
            searchPaths = [
                "/Applications/1Password.app/Contents/Frameworks/libop_sdk_ipc_client.dylib",
                path.join(os.homedir(), "/Applications/1Password.app/Contents/Frameworks/libop_sdk_ipc_client.dylib"),
            ];
            break;
        case "linux": // Linux
            searchPaths = [
                "/usr/bin/1password/libop_sdk_ipc_client.so",
                "/opt/1Password/libop_sdk_ipc_client.so",
                "/snap/bin/1password/libop_sdk_ipc_client.so",
            ];
            break;
        case "win32": // Windows
            searchPaths = [
                path.join(os.homedir(), "/AppData/Local/1Password/op_sdk_ipc_client.dll"),
                "C:/Program Files/1Password/app/8/op_sdk_ipc_client.dll",
                "C:/Program Files (x86)/1Password/app/8/op_sdk_ipc_client.dll",
                path.join(os.homedir(), "/AppData/Local/1Password/app/8/op_sdk_ipc_client.dll"),
            ];
            break;
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
    // Iterate through the possible paths and return the first one that exists.
    for (const addonPath of searchPaths) {
        if (fs.existsSync(addonPath)) {
            return addonPath;
        }
    }
    // If the loop completes without finding the file, throw an error.
    throw new Error("1Password desktop application not found");
};
/**
 * SharedLibCore: wrapper around the dynamically loaded shared library
 */
class SharedLibCore {
    constructor(accountName) {
        this.lib = null;
        try {
            const libPath = find1PasswordLibPath();
            const moduleStub = { exports: {} };
            process.dlopen(moduleStub, libPath);
            // Safely check the structure of the loaded module before casting.
            if (typeof moduleStub === "object" &&
                moduleStub !== null &&
                typeof moduleStub.exports === "object" &&
                moduleStub.exports !== null &&
                "sendMessage" in moduleStub.exports &&
                typeof moduleStub.exports.sendMessage ===
                    "function") {
                this.lib = moduleStub.exports;
            }
            else {
                throw new Error("Failed to initialize native library: sendMessage function not found on module.");
            }
        }
        catch (e) {
            console.error("A critical error occurred while loading the native addon:", e);
            this.lib = null;
        }
        this.acccountName = accountName;
    }
    /**
     * callSharedLibrary - send string to native function, receive string back.
     */
    callSharedLibrary(input, operation_type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.lib) {
                throw new Error("Native library is not available.");
            }
            if (!input || input.length === 0) {
                throw new Error("internal: empty input");
            }
            const inputEncoded = Buffer.from(input, "utf8").toString("base64");
            const req = {
                account_name: this.acccountName,
                kind: operation_type,
                payload: inputEncoded,
            };
            const inputBuf = Buffer.from(JSON.stringify(req), "utf8");
            const nativeResponse = yield this.lib.sendMessage(inputBuf);
            if (!(nativeResponse instanceof Uint8Array)) {
                throw new Error(`Native function returned an unexpected type. Expected Uint8Array, got ${typeof nativeResponse}`);
            }
            const respString = new TextDecoder().decode(nativeResponse);
            const response = JSON.parse(respString);
            if (response.success) {
                const decodedPayload = Buffer.from(response.payload).toString("utf8");
                // On success, the payload is the actual result string
                return decodedPayload;
            }
            else {
                // On failure, convert the error payload to a readable string and throw
                const errorMessage = Array.isArray(response.payload)
                    ? String.fromCharCode(...response.payload)
                    : JSON.stringify(response.payload);
                (0, errors_1.throwError)(errorMessage);
            }
        });
    }
    // Core interface implementation
    initClient(config) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callSharedLibrary(config, "init_client");
        });
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    initClientOidc(config, _fetcher) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("OIDC authentication is not supported with desktop auth");
        });
    }
    invoke(invokeConfigBytes) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.callSharedLibrary(invokeConfigBytes, "invoke");
        });
    }
    releaseClient(clientId) {
        this.callSharedLibrary(clientId, "release_client").catch((err) => {
            console.warn("failed to release client:", err);
        });
    }
}
exports.SharedLibCore = SharedLibCore;
