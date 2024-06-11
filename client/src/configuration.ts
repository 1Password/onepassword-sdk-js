import * as os from "os";
import fs from "fs";

import { ClientAuthConfig } from "./core.js";

export const LANGUAGE = "JS";
export const VERSION = fs.readFileSync("../client/src/version-build", "utf-8");

// Contains information necessary to configure an SDK client.
export interface ClientConfiguration {
  // Auth currently only accepts a service account token. Read more about how to get started with service accounts: https://developer.1password.com/docs/service-accounts/get-started/#create-a-service-account
  auth: Auth;
  integrationName: string;
  integrationVersion: string;
}

// Sets the authentication method. Use a token as a `string` to authenticate with a service account token.
type Auth = string;

/**
 * Creates a default client configuration.
 * @returns The client configuration to instantiate the client with.
 */
export const clientAuthConfig = (
  userConfig: ClientConfiguration,
): ClientAuthConfig => {
  // TODO: Add logic for computing the correct sanitized version value for each platform
  const defaultOsVersion = "0.0.0";
  return {
    serviceAccountToken: userConfig.auth,
    programmingLanguage: LANGUAGE,
    sdkVersion: VERSION,
    integrationName: userConfig.integrationName,
    integrationVersion: userConfig.integrationVersion,
    requestLibraryName: "Fetch API",
    requestLibraryVersion: "Fetch API",
    os: getOsName(),
    osVersion: defaultOsVersion,
    architecture: os.arch(),
  };
};

export const getOsName = (): string => {
  // Only supported on Node.js
  const os_name = os.type().toLowerCase();
  if (os_name === "windows_nt") {
    return "windows";
  }
  return os_name;
};
