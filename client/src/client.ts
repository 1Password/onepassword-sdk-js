import { InnerClient } from "./core.js";
import { ReportsApi, ReportsSource } from "./reports.js";
import { SecretsApi, SecretsSource } from "./secrets.js";

export class Client {
  public reports: ReportsApi;
  public secrets: SecretsApi;

  public constructor(innerClient: InnerClient) {
    this.reports = new ReportsSource(innerClient);
    this.secrets = new SecretsSource(innerClient);
  }
}
