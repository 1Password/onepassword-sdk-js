import { ClientAuthConfig, Core, InvokeConfig } from "../src/core";

// A mocked `Core` used only for testing.
export class TestCore implements Core {
  id: number;

  constructor() {
    this.id = 0;
  }
  
  invoke_sync(config: InvokeConfig): string {
    return JSON.stringify("method " +
      config.invocation.parameters.name +
      " with parameters " +
      JSON.stringify(config.invocation.parameters.parameters))
  }

  async initClient(config: string): Promise<string> {
    const res = this.id.toString();
    this.id++;
    return res;
  }

  async invoke(config: string): Promise<string> {
    const parsedConfig: InvokeConfig = JSON.parse(config);
    return JSON.stringify("method " +
      parsedConfig.invocation.parameters.name +
      " called on client " +
      parsedConfig.invocation.clientId +
      " with parameters " +
      JSON.stringify(parsedConfig.invocation.parameters.parameters))
  }

  async releaseClient(clientId: string) { }
}
