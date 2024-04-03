/**
  Module containing the 1Password SDK Client, which can be used to authenticate and access data stored in 1Password programmatically.
  @module
 */
import { InnerClient } from "./core.js";
import { SecretsApi, SecretsSource } from "./secrets.js";

// Client represents a client instance of the SDK.
export class Client {
  public secrets: SecretsApi;

  public constructor(innerClient: InnerClient) {
    this.secrets = new SecretsSource(innerClient);
  }
}
