import { InvokeConfig, InnerClient } from "./core.js";
import * as types from "./types.js";

/**
 *  The Items API holds all operations the SDK client can perform on 1Password items.
 */
export interface ItemsApi {
  /**
   *  Create a new item
   */
  create(item: types.Item): Promise<types.Item>;

  /**
   *  Get an item by vault and item ID
   */
  get(vaultId: string, itemId: string): Promise<types.Item>;

  /**
   *  Update an existing item. You can currently only edit text and concealed fields.
   */
  update(item: types.Item): Promise<types.Item>;

  /**
   *  Delete an item.
   */
  delete(vaultId: string, itemId: string): Promise<void>;
}

export class ItemsSource implements ItemsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  /**
   *  Create a new item
   */
  public async create(item: types.Item): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "Create",
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
   *  Get an item by vault and item ID
   */
  public async get(vaultId: string, itemId: string): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "Get",
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
   *  Update an existing item. You can currently only edit text and concealed fields.
   */
  public async update(item: types.Item): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "Update",
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
        name: "Delete",
        parameters: {
          vault_id: vaultId,
          item_id: itemId,
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<void>;
  }
}
