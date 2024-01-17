import {
  Client,
  ClientConfiguration,
  IntegrationInformation,
  language,
  ServiceAccountAuth,
  version,
} from "./client";
import { TestCore } from "./core";
import { SecretsSource } from "./secrets";

test("client gets created with the right configuration", () => {
  let client = new Client(
    new ClientConfiguration(
      new ServiceAccountAuth("ops_..."),
      new IntegrationInformation("Test app", "v1"),
    ),
  );

  expect(client.config.saToken).toBe("ops_...");
  expect(client.config.integrationName).toBe("Test app");
  expect(client.config.integrationVersion).toBe("v1");
  expect(client.config.requestLibraryName).toBe("");
  expect(client.config.requestLibraryVersion).toBe("");
  expect(client.config.language).toBe(language);
  expect(client.config.sdkVersion).toBe(version);
  expect(client.config.os).toBe("");
  expect(client.config.osVersion).toBe("");
  expect(client.config.arch).toBe("");
});

test("user must specify a service account token", () => {
  expect(() => {
    new Client(
      new ClientConfiguration(
        new ServiceAccountAuth(""),
        new IntegrationInformation("Test app", "v1"),
      ),
    );
  }).toThrow("No service account token was found");

  expect(() => {
    new Client(
      new ClientConfiguration(
        null,
        new IntegrationInformation("Test app", "v1"),
      ),
    );
  }).toThrow("No authentication information was provided");
});

test("user must specify proper integration information", () => {
  expect(() => {
    new Client(
      new ClientConfiguration(
        new ServiceAccountAuth("ops_..."),
        new IntegrationInformation("", ""),
      ),
    );
  }).toThrow(
    "Name and version must not be empty. Use the default constants if you don't want to provide specific information.",
  );

  expect(() => {
    new Client(
      new ClientConfiguration(
        new ServiceAccountAuth("ops_..."),
        new IntegrationInformation("Test!app", "v1"),
      ),
    );
  }).toThrow("Integration name contains characters which are not allowed");

  expect(() => {
    new Client(
      new ClientConfiguration(
        new ServiceAccountAuth("ops_..."),
        new IntegrationInformation("Test", "v11111111111111111111111"),
      ),
    );
  }).toThrow("Integration version string is too long");
});

test("authentication instantiates the secrets api", () => {
  let client = new Client(
    new ClientConfiguration(
      new ServiceAccountAuth("ops_..."),
      new IntegrationInformation("Test app", "v1"),
    ),
  );
  client.core = new TestCore();
  client.authenticate().then((authenticatedClient) => {
    expect(authenticatedClient.secrets).toBeDefined();
    if (authenticatedClient.secrets instanceof SecretsSource) {
      expect(authenticatedClient.secrets.clientID).toBe(1);
    }
  });
});

test("authenticated client resolves secrets correctly", () => {
  let client = new Client(
    new ClientConfiguration(
      new ServiceAccountAuth("ops_..."),
      new IntegrationInformation("Test app", "v1"),
    ),
  );
  client.core = new TestCore();
  client.authenticate().then((authenticatedClient) => {
    authenticatedClient.secrets
      .resolve("op://Private/test/field")
      .then((res) => {
        expect(res).toBe("secret");
      });
  });
});
