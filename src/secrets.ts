import { InvokeConfig } from "./core";
import { InnerClient } from "./configuration";

// SecretsAPI exposes functionality around secrets.
export interface SecretsAPI {
  // resolve takes as input a secret reference and returns the secret to which it points.
  resolve(secretReference: string): Promise<string>;
}

// SecretSource is an implementation of the SecretsAPI that wraps a Core.
export class SecretsSource implements SecretsAPI {
  #inner: InnerClient;

  constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  resolve(secretReference: string): Promise<string> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "Resolve",
        parameters: secretReference,
      },
    };
    return this.#inner.core.invoke(invocationConfig);
  }
}
