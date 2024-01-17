import { SecretsAPI, SecretsSource } from "./secrets";
import { ClientAuthConfig, Core, TestCore } from "./core";

export const language = "JS";
export const version = "0010001"; // v0.1.0
export const defaultIntegrationName = "Unknown";
export const defaultIntegrationVersion = "Unknown";

// Client represents a client instance of the SDK.
export class Client {
  public secrets?: SecretsAPI;

  core: Core;
  config: ClientAuthConfig;

  constructor(config: ClientConfiguration) {
    this.core = new TestCore();
    this.config = config.getAuthConfig();
  }

  // authenticate returns an authenticated client whose SecretsAPI is ready to be used.
  async authenticate(): Promise<Client> {
    let clientID = await this.core.initClient(this.config);
    this.secrets = new SecretsSource(parseInt(clientID), this.core);
    return this;
  }
}

const maxIntegrationNameLen = 40;
const maxIntegrationVersionLen = 20;
const allowedChars = /^[a-zA-Z0-9_. -]*$/;

// ClientConfiguration is used to configure an SDK client.
export class ClientConfiguration {
  auth: Auth;
  integrationInfo: IntegrationInformation;

  public constructor(auth: Auth, integrationInfo: IntegrationInformation) {
    this.integrationInfo = integrationInfo;
    this.auth = auth;
  }

  getAuthConfig(): ClientAuthConfig {
    if (!(this.auth instanceof ServiceAccountAuth)) {
      throw new Error("No authentication information was provided");
    } else if (this.auth.getCredentials() === "") {
      throw new Error("No service account token was found");
    }

    if (
      this.integrationInfo.name.length === 0 ||
      this.integrationInfo.version.length === 0
    ) {
      throw new Error(
        "Name and version must not be empty. Use the default constants if you don't want to provide specific information.",
      );
    } else {
      if (this.integrationInfo.name.length > maxIntegrationNameLen) {
        throw new Error("Integration name is too long");
      }
      if (!allowedChars.test(this.integrationInfo.name)) {
        throw new Error(
          "Integration name contains characters which are not allowed",
        );
      }
      if (this.integrationInfo.version.length > maxIntegrationVersionLen) {
        throw new Error("Integration version string is too long");
      }
      if (!allowedChars.test(this.integrationInfo.version)) {
        throw new Error(
          "Integration version contains characters which are not allowed",
        );
      }
    }

    return {
      saToken: this.auth.getCredentials(),
      language: language,
      sdkVersion: version,
      integrationName: this.integrationInfo.name,
      integrationVersion: this.integrationInfo.version,
      requestLibraryName: "",
      requestLibraryVersion: "",
      os: "",
      osVersion: "",
      arch: "",
    };
  }
}

// Auth is the authentication method used by an SDK client.
type Auth = ServiceAccountAuth | null;

export class ServiceAccountAuth {
  private readonly token: string;

  public constructor(token: string) {
    this.token = token;
  }

  public getCredentials(): string {
    return this.token;
  }
}

// IntegrationInformation contains the name and version of the integration built using the 1Password JS SDK.
export class IntegrationInformation {
  name: string;
  version: string;

  public constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }
}
