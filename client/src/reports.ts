import { InvokeConfig, InnerClient } from "./core.js";
import * as types from "./types.js";

export interface ReportsApi {
  getAccountOverview(): Promise<types.AccountOverview>;
}

export class ReportsSource implements ReportsApi {
  #inner: InnerClient;

  public constructor(inner: InnerClient) {
    this.#inner = inner;
  }

  public async getAccountOverview(): Promise<types.AccountOverview> {
    const invocationConfig: InvokeConfig = {
      clientId: this.#inner.id,
      invocation: {
        name: "GetAccountOverview",
        parameters: {},
      },
    };
    return JSON.parse(
      await this.#inner.core.invoke(invocationConfig),
    ) as Promise<types.AccountOverview>;
  }
}
