import { InvokeConfig } from "./core.js";
import { InnerClient } from "./configuration.js";
import * as types from "./types.js";

export interface ItemsApi {
  getItem(itemUuid: string): Promise<types.Item>;
}

export class ItemsSource implements ItemsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  public async getItem(itemUuid: string): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "GetItem",
        parameters: itemUuid,
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<types.Item>;
  }
}
