import { InnerClient } from "./core.js";
import { GroupAccess, GroupVaultAccess, Vault, VaultCreateParams, VaultGetParams, VaultListParams, VaultOverview, VaultUpdateParams } from "./types.js";
/**
 * The Vaults API holds all the operations the SDK client can perform on 1Password vaults.
 */
export interface VaultsApi {
    /**
     * Create a new user vault.
     */
    create(params: VaultCreateParams): Promise<Vault>;
    /**
     * List information about vaults that's configurable based on some input parameters.
     */
    list(params?: VaultListParams): Promise<VaultOverview[]>;
    /**
     * Get an overview of a vault by its ID.
     */
    getOverview(vaultId: string): Promise<VaultOverview>;
    /**
     * Get detailed vault information by vault ID and parameters.
     */
    get(vaultId: string, vaultParams: VaultGetParams): Promise<Vault>;
    /**
     * Update a vault
     */
    update(vaultId: string, params: VaultUpdateParams): Promise<Vault>;
    /**
     * Delete a vault by its ID.
     */
    delete(vaultId: string): Promise<void>;
    /**
     * Grant group permissions to a vault.
     */
    grantGroupPermissions(vaultId: string, groupPermissionsList: GroupAccess[]): Promise<void>;
    /**
     * Update group permissions for vaults.
     */
    updateGroupPermissions(groupPermissionsList: GroupVaultAccess[]): Promise<void>;
    /**
     * Revoke group permissions from a vault.
     */
    revokeGroupPermissions(vaultId: string, groupId: string): Promise<void>;
}
export declare class Vaults implements VaultsApi {
    #private;
    constructor(inner: InnerClient);
    /**
     * Create a new user vault.
     */
    create(params: VaultCreateParams): Promise<Vault>;
    /**
     * List information about vaults that's configurable based on some input parameters.
     */
    list(params?: VaultListParams): Promise<VaultOverview[]>;
    /**
     * Get an overview of a vault by its ID.
     */
    getOverview(vaultId: string): Promise<VaultOverview>;
    /**
     * Get detailed vault information by vault ID and parameters.
     */
    get(vaultId: string, vaultParams: VaultGetParams): Promise<Vault>;
    /**
     * Update a vault
     */
    update(vaultId: string, params: VaultUpdateParams): Promise<Vault>;
    /**
     * Delete a vault by its ID.
     */
    delete(vaultId: string): Promise<void>;
    /**
     * Grant group permissions to a vault.
     */
    grantGroupPermissions(vaultId: string, groupPermissionsList: GroupAccess[]): Promise<void>;
    /**
     * Update group permissions for vaults.
     */
    updateGroupPermissions(groupPermissionsList: GroupVaultAccess[]): Promise<void>;
    /**
     * Revoke group permissions from a vault.
     */
    revokeGroupPermissions(vaultId: string, groupId: string): Promise<void>;
}
