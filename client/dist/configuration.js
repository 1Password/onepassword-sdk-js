"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOsName = exports.clientAuthConfig = exports.DesktopAuth = exports.VERSION = exports.LANGUAGE = void 0;
const os_1 = __importDefault(require("os"));
const version_js_1 = require("./version.js");
exports.LANGUAGE = "JS";
exports.VERSION = version_js_1.SDK_BUILD_NUMBER;
/**
 * Setting that specifies a client should use the desktop app to authenticate. Set accountName to your 1Password account name as shown at the top left sidebar of the app, or your account UUID.
 */
class DesktopAuth {
    constructor(accountName) {
        this.accountName = accountName;
    }
}
exports.DesktopAuth = DesktopAuth;
/**
 * Creates a default client configuration.
 * @returns The client configuration to instantiate the client with.
 */
const clientAuthConfig = (userConfig) => {
    // TODO: Add logic for computing the correct sanitized version value for each platform
    const defaultOsVersion = "0.0.0";
    let serviceAccountToken;
    let accountName;
    if (typeof userConfig.auth === "string") {
        serviceAccountToken = userConfig.auth;
    }
    else if (userConfig.auth instanceof DesktopAuth) {
        accountName = userConfig.auth.accountName;
    }
    return {
        serviceAccountToken: serviceAccountToken !== null && serviceAccountToken !== void 0 ? serviceAccountToken : "",
        accountName,
        programmingLanguage: exports.LANGUAGE,
        sdkVersion: exports.VERSION,
        integrationName: userConfig.integrationName,
        integrationVersion: userConfig.integrationVersion,
        requestLibraryName: "Fetch API",
        requestLibraryVersion: "Fetch API",
        os: (0, exports.getOsName)(),
        osVersion: defaultOsVersion,
        architecture: os_1.default.arch(),
        workloadDetails: userConfig.workloadDetails,
    };
};
exports.clientAuthConfig = clientAuthConfig;
const getOsName = () => {
    // Only supported on Node.js
    const os_name = os_1.default.type().toLowerCase();
    if (os_name === "windows_nt") {
        return "windows";
    }
    return os_name;
};
exports.getOsName = getOsName;
