import { ClientAuthConfig, Core, InvokeConfig } from "../src/core";

// TestCore is a mocked Core used only for testing.
export class TestCore implements Core {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
  async initClient(config: ClientAuthConfig): Promise<string> {
    const res = this.id.toString();
    this.id++;
    return res;
  }

  async invoke(config: InvokeConfig): Promise<string> {
    return (
      "method " +
      config.invocation.name +
      " called on client " +
      config.clientId +
      " with parameters " +
      config.invocation.parameters
    );
  }

  async releaseClient(clientId: number) {
    this.id--;
  }
}
