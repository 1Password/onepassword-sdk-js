import { ClientAuthConfig, Core, InvokeConfig } from "../src/core";

// A mocked `Core` used only for testing.
export class TestCore implements Core {
  id: number;

  constructor() {
    this.id = 0;
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

  async releaseClient(clientId: number) { }
}
