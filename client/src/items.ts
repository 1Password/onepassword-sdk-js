// Code generated by op-codegen - DO NOT EDIT MANUALLY

import { InvokeConfig, InnerClient, SharedCore } from "./core.js";
import { SdkIterable } from "./iterator.js";
import { Item, ItemCreateParams, ItemOverview, ReviverFunc } from "./types.js";
import { ItemsSharesApi, ItemsShares } from "./items_shares.js";
import { ItemsFilesApi, ItemsFiles } from "./items_files.js";

/**
 * The Items API holds all operations the SDK client can perform on 1Password items.
 */
export interface ItemsApi {
  shares: ItemsSharesApi;
  files: ItemsFilesApi;
  /**
   * Create a new item.
   */
  create(params: ItemCreateParams): Promise<Item>;

  /**
   * Get an item by vault and item ID
   */
  get(vaultId: string, itemId: string): Promise<Item>;

  /**
   * Update an existing item.
   */
  put(item: Item): Promise<Item>;

  /**
   * Delete an item.
   */
  delete(vaultId: string, itemId: string);

  /**
   * Archive an item.
   */
  archive(vaultId: string, itemId: string);

  /**
   * List all items
   */
  listAll(vaultId: string): Promise<SdkIterable<ItemOverview>>;
}

export class Items implements ItemsApi {
  #inner: InnerClient;
  public shares: ItemsSharesApi;
  public files: ItemsFilesApi;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
    this.shares = new ItemsShares(inner);
    this.files = new ItemsFiles(inner);
  }

  /**
   * Create a new item.
   */
  public async create(params: ItemCreateParams): Promise<Item> {
    const invocationConfig: InvokeConfig = {
      invocation: {
        clientId: this.#inner.id,
        parameters: {
          name: "ItemsCreate",
          parameters: {
            params,
          },
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
      ReviverFunc,
    ) as Promise<Item>;
  }

  /**
   * Get an item by vault and item ID
   */
  public async get(vaultId: string, itemId: string): Promise<Item> {
    const invocationConfig: InvokeConfig = {
      invocation: {
        clientId: this.#inner.id,
        parameters: {
          name: "ItemsGet",
          parameters: {
            vault_id: vaultId,
            item_id: itemId,
          },
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
      ReviverFunc,
    ) as Promise<Item>;
  }

  /**
   * Update an existing item.
   */
  public async put(item: Item): Promise<Item> {
    const invocationConfig: InvokeConfig = {
      invocation: {
        clientId: this.#inner.id,
        parameters: {
          name: "ItemsPut",
          parameters: {
            item,
          },
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
      ReviverFunc,
    ) as Promise<Item>;
  }

  /**
   * Delete an item.
   */
  public async delete(vaultId: string, itemId: string) {
    const invocationConfig: InvokeConfig = {
      invocation: {
        clientId: this.#inner.id,
        parameters: {
          name: "ItemsDelete",
          parameters: {
            vault_id: vaultId,
            item_id: itemId,
          },
        },
      },
    };
    await this.#inner.core.invoke(invocationConfig);
  }

  /**
   * Archive an item.
   */
  public async archive(vaultId: string, itemId: string) {
    const invocationConfig: InvokeConfig = {
      invocation: {
        clientId: this.#inner.id,
        parameters: {
          name: "ItemsArchive",
          parameters: {
            vault_id: vaultId,
            item_id: itemId,
          },
        },
      },
    };
    await this.#inner.core.invoke(invocationConfig);
  }

  /**
   * List all items
   */
  public async listAll(vaultId: string): Promise<SdkIterable<ItemOverview>> {
    const invocationConfig: InvokeConfig = {
      invocation: {
        clientId: this.#inner.id,
        parameters: {
          name: "ItemsListAll",
          parameters: {
            vault_id: vaultId,
          },
        },
      },
    };
    return new SdkIterable<ItemOverview>(
      JSON.parse(
        await this.#inner.core.invoke(invocationConfig),
        ReviverFunc,
      ) as ItemOverview[],
    );
  }
}
