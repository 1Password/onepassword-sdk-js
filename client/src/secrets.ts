/**
 Module defining the Secrets API.
 The Secrets API can be used to access secrets stored in 1Password via secret references (op://vault/item/field).
 It is implemented by the 1Passwor
 */
import { InvokeConfig, InnerClient } from "./core.js";

/**
 Exposes functionality for retrieving secrets.
 */
export interface SecretsApi {
  /**
    Takes as input a secret reference and returns the secret to which it points.
    @param secretReference - A string containing a secret reference (string of the form "op://vault/item/field").
    @returns The value of the referenced 1Password item field.
   */
  resolve(secretReference: string): Promise<string>;
}

/**
  @inheritdoc
 */
export class SecretsSource implements SecretsApi {
  /**
    @internal
   */
  #inner: InnerClient;

  /**
  @internal
   */
  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  /**
    @inheritdoc
   */
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
