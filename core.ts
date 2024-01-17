export interface Core {
  initClient(config: ClientAuthConfig): Promise<string>;
  invoke(config: Invocation): Promise<string>;
  releaseClient(clientId: number): void;
}

export interface ClientAuthConfig {
  saToken: string;
  language: string;
  sdkVersion: string;
  integrationName: string;
  integrationVersion: string;
  requestLibraryName: string;
  requestLibraryVersion: string;
  os: string;
  osVersion: string;
  arch: string;
}

export interface Invocation {
  client: number;
  name: string;
  data: string;
}

export class TestCore implements Core {
  async initClient(config: ClientAuthConfig): Promise<string> {
    return "1";
  }

  async invoke(config: Invocation): Promise<string> {
    return "secret";
  }

  async releaseClient(clientId: number) {}
}
