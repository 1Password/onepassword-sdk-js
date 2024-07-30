import { InvokeConfig, InnerClient } from "./core.js";
import * as types from "./types.js";
import { SdkList } from "./iterator.js";

/**
 *  The Secrets API includes all operations the SDK client can perform on secrets.
 *  Use secret reference URIs to securely load secrets from 1Password: op://<vault-name>/<item-name>[/<section-name>]/<field-name>
 */
export interface SecretsApi {
  /**
   *  Resolve returns the secret the provided secret reference points to.
   */
  resolve(secretReference: string): Promise<string>;
}

export class SecretsSource implements SecretsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  /**
   *  Resolve returns the secret the provided secret reference points to.
   */
  public async resolve(secretReference: string): Promise<string> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "SecretsResolve",
        parameters: {
          secret_reference: secretReference,
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<string>;
  }
}
