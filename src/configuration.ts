import { Core } from "./core";

// InnerClient represents the client instance on which a call is made
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

// Authentication method. For now only Service Account Authentication is supported so this will always be a token.
type Auth = string;
