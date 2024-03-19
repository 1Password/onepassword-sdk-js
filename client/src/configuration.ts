/**
     Module defining configuration options for the 1Password SDK.
    @module
 */
import { Core } from "./core.js";

/**
  Represents the client instance on which a call is made.
  @internal
 */
export interface InnerClient {
  id: number;
  core: Core;
}

/**
  Defines all parameters that can be used to configure the 1Password SDK Client.
 */
export interface ClientConfiguration {
  auth: Auth;
  integrationName: string;
  integrationVersion: string;
}

/**
  Sets the authentication method. Supply a `string` to authenticate with a service account token.
 */
type Auth = string;
