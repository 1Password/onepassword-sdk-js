import { InnerClient } from "./core.js";
import { Item, ItemCreateParams, ItemListFilter, ItemOverview, ItemsDeleteAllResponse, ItemsGetAllResponse, ItemsUpdateAllResponse } from "./types.js";
import { ItemsSharesApi } from "./items_shares.js";
import { ItemsFilesApi } from "./items_files.js";
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
     * Create items in batch, within a single vault.
     */
    createAll(vaultId: string, params: ItemCreateParams[]): Promise<ItemsUpdateAllResponse>;
    /**
     * Get an item by vault and item ID.
     */
    get(vaultId: string, itemId: string): Promise<Item>;
    /**
     * Get items by vault and their item IDs.
     */
    getAll(vaultId: string, itemIds: string[]): Promise<ItemsGetAllResponse>;
    /**
     * Update an existing item.
     */
    put(item: Item): Promise<Item>;
    /**
     * Delete an item.
     */
    delete(vaultId: string, itemId: string): Promise<void>;
    /**
     * Delete items in batch, within a single vault.
     */
    deleteAll(vaultId: string, itemIds: string[]): Promise<ItemsDeleteAllResponse>;
    /**
     * Archive an item.
     */
    archive(vaultId: string, itemId: string): Promise<void>;
    /**
     * List items based on filters.
     */
    list(vaultId: string, ...filters: ItemListFilter[]): Promise<ItemOverview[]>;
}
export declare class Items implements ItemsApi {
    #private;
    shares: ItemsSharesApi;
    files: ItemsFilesApi;
    constructor(inner: InnerClient);
    /**
     * Create a new item.
     */
    create(params: ItemCreateParams): Promise<Item>;
    /**
     * Create items in batch, within a single vault.
     */
    createAll(vaultId: string, params: ItemCreateParams[]): Promise<ItemsUpdateAllResponse>;
    /**
     * Get an item by vault and item ID.
     */
    get(vaultId: string, itemId: string): Promise<Item>;
    /**
     * Get items by vault and their item IDs.
     */
    getAll(vaultId: string, itemIds: string[]): Promise<ItemsGetAllResponse>;
    /**
     * Update an existing item.
     */
    put(item: Item): Promise<Item>;
    /**
     * Delete an item.
     */
    delete(vaultId: string, itemId: string): Promise<void>;
    /**
     * Delete items in batch, within a single vault.
     */
    deleteAll(vaultId: string, itemIds: string[]): Promise<ItemsDeleteAllResponse>;
    /**
     * Archive an item.
     */
    archive(vaultId: string, itemId: string): Promise<void>;
    /**
     * List items based on filters.
     */
    list(vaultId: string, ...filters: ItemListFilter[]): Promise<ItemOverview[]>;
}
