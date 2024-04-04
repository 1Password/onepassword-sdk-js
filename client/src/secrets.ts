import { InvokeConfig, InnerClient } from "./core.js";

export interface SecretsApi {
  resolve(secretReference: string): Promise<string>;
}

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
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<string>;
  }
}
