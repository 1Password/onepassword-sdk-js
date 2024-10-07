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
    return JSON.stringify("method " +
      config.invocation.parameters.name +
      " called on client " +
      config.invocation.clientId +
      " with parameters " +
      JSON.stringify(config.invocation.parameters.parameters))
  }

  async releaseClient(clientId: number) { }
}
