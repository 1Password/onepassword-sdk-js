import { Core } from "./core.js";

// InnerClient represents the client instance on which a call is made
export interface InnerClient {
  id: number;
  core: Core;
}

// `ClientConfiguration` contains information necessary to configure an SDK client.
export interface ClientConfiguration {
  auth: Auth;
  integrationName: string;
  integrationVersion: string;
}

// Sets the authentication method. Currently, the SDK only supports authentication with [service accounts](https://developer.1password.com/docs/service-accounts), so the authentication type must be set to string to authenticate with a service account token.
type Auth = string;
