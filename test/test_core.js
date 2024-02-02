// TestCore is a mocked Core used only for testing.
export class TestCore {
    constructor(id) {
        this.id = id;
    }
    async initClient(config) {
        const res = this.id.toString();
        this.id++;
        return res;
    }
    async invoke(config) {
        return ("method " +
            config.invocation.name +
            " called on client " +
            config.clientId +
            " with parameters " +
            config.invocation.parameters);
    }
    async releaseClient(clientId) {
        this.id--;
    }
}
