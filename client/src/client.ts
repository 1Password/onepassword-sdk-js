import { InnerClient } from "./core.js";
import { SecretsApi, SecretsSource } from "./secrets.js";
import { ItemsApi, ItemsSource } from "./items.js";

export class Client {
  public secrets: SecretsApi;
  // The Items API contains all operations the SDK client can perform on 1Password items.
  public items: ItemsApi;

  public constructor(innerClient: InnerClient) {
    this.secrets = new SecretsSource(innerClient);
    this.items = new ItemsSource(innerClient);
  }
}
