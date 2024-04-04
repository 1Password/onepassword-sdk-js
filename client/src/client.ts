import { InnerClient } from "./core.js";
import { SecretsApi, SecretsSource } from "./secrets.js";

export class Client {
  public secrets: SecretsApi;

  public constructor(innerClient: InnerClient) {
    this.secrets = new SecretsSource(innerClient);
  }
}
