import { Core, Invocation } from "./core";

// SecretsAPI exposes functionality around secrets.
export interface SecretsAPI {
  // resolve takes as input a secret reference and returns the secret to which it points.
  resolve(secretReference: string): Promise<string>;
}

// SecretSource is an implementation of the SecretsAPI that wraps a Core.
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
