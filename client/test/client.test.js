const {
  createClientWithCore,
  createWorkloadClientWithCore,
} = require("../dist/client_builder.js");
const {
  clientAuthConfig,
  getOsName,
  VERSION,
  LANGUAGE,
} = require("../dist/configuration.js");
const { SharedCore } = require("../dist/core.js");
const { TestCore } = require("./test_core");

test("the right configuration is created", () => {
  const config = clientAuthConfig({
    auth: "ops_...",
    integrationName: "Test app",
    integrationVersion: "v1",
  });

  expect(config.serviceAccountToken).toBe("ops_...");
  expect(config.integrationName).toBe("Test app");
  expect(config.integrationVersion).toBe("v1");
  expect(config.requestLibraryName).toBe("Fetch API");
  expect(config.requestLibraryVersion).toBe("Fetch API");
  expect(config.programmingLanguage).toBe(LANGUAGE);
  expect(config.sdkVersion).toBe(VERSION);
  expect(config.os).toBe(getOsName());
  expect(config.osVersion).toBe("0.0.0");
  expect(config.architecture).toContain("64");
});

test("authenticated client resolves secrets correctly", () => {
  const core = new TestCore();
  const sharedCore = new SharedCore();
  sharedCore.setInner(core);
  createClientWithCore(
    {
      auth: "test token",
      integrationName: "test integration",
      integrationVersion: "test integration",
    },
    sharedCore,
  ).then((client) => {
    expect(client.secrets).toBeDefined();
    expect(core.id).toBe(1);
    client.secrets.resolve("secret_ref").then((secret) => {
      expect(secret).toBe(
        'method SecretsResolve called on client 0 with parameters {"secret_reference":"secret_ref"}',
      );
    });
  });
});

test("OAuth credentials select the OAuth client configuration", async () => {
  const core = new TestCore();
  const initClient = jest.spyOn(core, "initClient");
  const initClientOidc = jest.spyOn(core, "initClientOidc");
  const sharedCore = new SharedCore();
  sharedCore.setInner(core);
  const config = {
    accessToken: "test-access-token",
    integrationKey: "ops_test-integration-key",
  };

  await createWorkloadClientWithCore(config, sharedCore);

  expect(initClientOidc).not.toHaveBeenCalled();
  expect(initClient).toHaveBeenCalledTimes(1);
  expect(JSON.parse(initClient.mock.calls[0][0])).toEqual(config);
});

test("credential broker uses the current core invocation names", async () => {
  const sharedCore = new SharedCore();
  sharedCore.setInner(new TestCore());
  const client = await createWorkloadClientWithCore(
    {
      accessToken: "test-access-token",
      integrationKey: "ops_test-integration-key",
    },
    sharedCore,
  );

  const accessRequest = await client.credentialBroker.accessRequest.create({
    entries: [{ type: "login", parameters: {} }],
  });
  const status = await client.credentialBroker.accessRequest.get("request-id");

  expect(accessRequest).toContain(
    "method CredentialBrokerAccessRequestsCreate",
  );
  expect(status).toContain("method CredentialBrokerAccessRequestsGetStatus");
});
