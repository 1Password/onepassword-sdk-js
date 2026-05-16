import { InnerClient } from "./core.js";
import { Group, GroupGetParams } from "./types.js";
/**
 * The Groups API holds all the operations the SDK client can perform on 1Password groups.
 */
export interface GroupsApi {
    /**
     * Get a group by its ID and parameters.
     */
    get(groupId: string, groupParams: GroupGetParams): Promise<Group>;
}
export declare class Groups implements GroupsApi {
    #private;
    constructor(inner: InnerClient);
    /**
     * Get a group by its ID and parameters.
     */
    get(groupId: string, groupParams: GroupGetParams): Promise<Group>;
}
