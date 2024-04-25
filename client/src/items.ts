import { InvokeConfig, InnerClient } from "./core.js";
import * as types from "./types.js";

export interface ItemsApi {
  create(item: types.Item): Promise<types.Item>;
}

export class ItemsSource implements ItemsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  public async create(item: types.Item): Promise<types.Item> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "Create",
        parameters: {
          item: item,
        },
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<types.Item>;
  }
}
