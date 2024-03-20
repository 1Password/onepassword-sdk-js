import { Core } from "./core.js";

// Represents the client instance on which a call is made.
export interface InnerClient {
  id: number;
  core: Core;
}

// Contains information necessary to configure an SDK client.
export interface ClientConfiguration {
  // Auth currently only accepts a service account token. Read more about how to get started with service accounts: https://developer.1password.com/docs/service-accounts/get-started/#create-a-service-account 
  auth: Auth;
  integrationName: string;
  integrationVersion: string;
}

// Sets the authentication method. Use a token as a `string` to authenticate with a service account token.
type Auth = string;
