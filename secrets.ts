import { Core, Invocation } from "./core";

export interface SecretsAPI {
  resolve(secretReference: string): Promise<string>;
}

export class SecretsSource implements SecretsAPI {
  clientID: number;
  core: Core;

  constructor(clientID: number, core: Core) {
    this.clientID = clientID;
    this.core = core;
  }

  resolve(secretReference: string): Promise<string> {
    let invocationConfig: Invocation = {
      client: this.clientID,
      name: "Resolve",
      data: secretReference,
    };
    return this.core.invoke(invocationConfig);
  }
}
