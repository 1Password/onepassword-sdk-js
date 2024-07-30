import { InvokeConfig, InnerClient } from "./core.js";
import * as types from "./types.js";
import { SdkIterable } from "./iterator.js";

/**
 *  The Items API holds all operations the SDK client can perform on 1Password items.
 */
export interface ItemsApi {
  /**
   *  Create a new item
   */
  create(params: types.ItemCreateParams): Promise<types.Item>;

  /**
   *  Get an item by vault and item ID
   */
  get(vaultId: string, itemId: string): Promise<types.Item>;

  /**
   *  Update an existing item.
   */
  put(item: types.Item): Promise<types.Item>;

  /**
   *  Delete an item.
   */
  delete(vaultId: string, itemId: string): Promise<void>;

  /**
   *  List all items
   */
  list(vaultId: string): Promise<SdkIterable<types.ItemOverview>>;
}

export class ItemsSource implements ItemsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  /**
   *  Create a new item
   */
  public async create(params: types.ItemCreateParams): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "ItemsCreate",
        parameters: {
          params,
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<types.Item>;
  }

  /**
   *  Get an item by vault and item ID
   */
  public async get(vaultId: string, itemId: string): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "ItemsGet",
        parameters: {
          vault_id: vaultId,
          item_id: itemId,
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<types.Item>;
  }

  /**
   *  Update an existing item.
   */
  public async put(item: types.Item): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "ItemsPut",
        parameters: {
          item,
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<types.Item>;
  }

  /**
   *  Delete an item.
   */
  public async delete(vaultId: string, itemId: string): Promise<void> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "ItemsDelete",
        parameters: {
          vault_id: vaultId,
          item_id: itemId,
        },
      },
    };
    await this.#inner.core.invoke(invocationConfig);
  }

  /**
   *  List all items
   */
  public async list(vaultId: string): Promise<SdkIterable<types.ItemOverview>> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "ItemsList",
        parameters: {
          vault_id: vaultId,
        },
      },
    };
    return new SdkIterable<types.ItemOverview>(
      JSON.parse(
        await this.#inner.core.invoke(invocationConfig),
      ) as types.ItemOverview[],
    );
  }
}
