import { InvokeConfig, InnerClient } from "./core.js";
import * as types from "./types.js";

/**
 *  Secrets point to fields in 1Password. They have the following format: op://<vault-name>/<item-name>[/<section-name>]/<field-name>
 */
/**
 *  Read more about secrets: https://developer.1password.com/docs/cli/secret-references
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
        name: "Resolve",
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
