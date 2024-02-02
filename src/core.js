import { init_client, invoke, release_client, } from "./js-core/core.js";
// SharedCore is an implementation of the Core interface that shares resources across all clients.
export class SharedCore {
    async initClient(config) {
        const c = JSON.stringify(config);
        console.log("before init_client in JS SDK");
        const id = await init_client(c);
        console.log("after init_client in JS SDK");
        console.log(id);
        return id;
    }
    async invoke(config) {
        const c = JSON.stringify(config);
        console.log("before invoke in JS SDK");
        const response = await invoke(c);
        console.log("after invoke in JS SDK");
        console.log(response);
        return response;
    }
    releaseClient(clientId) {
        release_client(BigInt(clientId));
    }
}
