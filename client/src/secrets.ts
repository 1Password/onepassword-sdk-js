import { InvokeConfig, InnerClient } from "./core.js";

// Exposes functionality around secrets.
export interface SecretsApi {
  // Takes as input a secret reference and returns the secret to which it points.
  resolve(secretReference: string): Promise<string>;
}

// An implementation of the `SecretsAPI` that wraps a `Core`.
export class SecretsSource implements SecretsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  public async resolve(secretReference: string): Promise<string> {
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
