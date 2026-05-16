import { InnerClient } from "./core.js";
import { SecretsApi } from "./secrets.js";
import { ItemsApi } from "./items.js";
import { VaultsApi } from "./vaults.js";
import { EnvironmentsApi } from "./environments.js";
import { GroupsApi } from "./groups.js";
export declare class Client {
    secrets: SecretsApi;
    items: ItemsApi;
    vaults: VaultsApi;
    environments: EnvironmentsApi;
    groups: GroupsApi;
    constructor(innerClient: InnerClient);
}
