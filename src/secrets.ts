import { InvokeConfig } from "./core.js";
import { InnerClient } from "./configuration.js";

// Exposes functionality around secrets.
export interface SecretsAPI {
  // Takes as input a secret reference and returns the secret to which it points.
  resolve(secretReference: string): Promise<string>;
}

// An implementation of the `SecretsAPI` that wraps a `Core`.
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
