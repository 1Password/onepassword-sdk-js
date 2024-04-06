import { InnerClient } from "./core.js";
import { SecretsApi, SecretsSource } from "./secrets.js";
import { ReportsApi, ReportsSource } from "./reports.js";

export class Client {
  public secrets: SecretsApi;
  public reports: ReportsApi;

  public constructor(innerClient: InnerClient) {
    this.secrets = new SecretsSource(innerClient);
    this.reports = new ReportsSource(innerClient);
  }
}
