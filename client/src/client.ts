import { InnerClient } from "./configuration.js";
import { SecretsApi, SecretsSource } from "./secrets.js";

// Client represents a client instance of the SDK.
export class Client {
  public secrets: SecretsApi;

  public constructor(innerClient: InnerClient) {
    this.secrets = new SecretsSource(innerClient);
  }
}
