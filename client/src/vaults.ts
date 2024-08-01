import { InvokeConfig, InnerClient } from "./core.js";
import * as types from "./types.js";
import { SdkIterable } from "./iterator.js";

/**
 *  The Vaults API holds all the operations the SDK client can perform on 1Password vaults.
 */
export interface VaultsApi {
  /**
   *  List all vaults
   */
  list(): Promise<SdkIterable<types.VaultOverview>>;
}

export class VaultsSource implements VaultsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  /**
   *  List all vaults
   */
  public async list(): Promise<SdkIterable<types.VaultOverview>> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "VaultsList",
        parameters: {},
      },
    };
    return new SdkIterable<types.VaultOverview>(
      JSON.parse(
        await this.#inner.core.invoke(invocationConfig),
      ) as types.VaultOverview[],
    );
  }
}
