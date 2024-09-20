import { InvokeConfig, InnerClient, Parameters } from "./core.js";
import * as types from "./types.js";
import { SdkIterable } from "./iterator.js";

/**
 *  The Vaults API holds all the operations the SDK client can perform on 1Password vaults.
 */
export interface VaultsApi {
  /**
   *  List all vaults
   */
  listAll(): Promise<SdkIterable<types.VaultOverview>>;
}

export class VaultsSource implements VaultsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  /**
   *  List all vaults
   */
  public async listAll(): Promise<SdkIterable<types.VaultOverview>> {
    const invocationConfig: InvokeConfig = {
      invocation: {
        clientId: this.#inner.id,
        parameter: {
          name: "VaultsListAll",
          parameters: {},
        },
      },
    };
    return new SdkIterable<types.VaultOverview>(
      JSON.parse(
        await this.#inner.core.invoke(invocationConfig),
      ) as types.VaultOverview[],
    );
  }
}
