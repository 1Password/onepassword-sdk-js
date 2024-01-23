import { Core } from "./core";

export interface InnerClient {
  id: number;
  core: Core;
}

// ClientConfiguration is used to configure an SDK client.
export interface ClientConfiguration {
  auth: Auth;
  integrationName: string;
  integrationVersion: string;
}

type Auth = string;
