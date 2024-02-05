import { Core } from "./core";

// Represents the client instance on which a call is made.
export interface InnerClient {
  id: number;
  core: Core;
}

// Contains information necessary to configure an SDK client.
export interface ClientConfiguration {
  auth: Auth;
  integrationName: string;
  integrationVersion: string;
}

// Sets the authentication method. Use `string` to authenticate with a service account token.
type Auth = string;
