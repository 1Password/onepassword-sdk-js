import { InnerClient } from "./core.js";
import { SecretsApi, SecretsSource } from "./secrets.js";
import { ItemsApi, ItemsSource } from "./items.js";
import { VaultsApi, VaultsSource } from "./vaults.js";

export class Client {
  public secrets: SecretsApi;
  public items: ItemsApi;
  public vaults: VaultsApi;

  public constructor(innerClient: InnerClient) {
    this.secrets = new SecretsSource(innerClient);
    this.items = new ItemsSource(innerClient);
    this.vaults = new VaultsSource(innerClient);
  }
}
