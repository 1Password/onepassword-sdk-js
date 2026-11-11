const { createClientWithCore } = require("../dist/client_builder.js");
const { clientAuthConfig, getOsName, VERSION, LANGUAGE, DesktopAuth } = require("../dist/configuration.js");
const fs = require("fs");
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

test("createClient throws when neither auth nor oidcFetcher is provided", async () => {
  const core = new TestCore();
  const sharedCore = new SharedCore();
  sharedCore.setInner(core);

  await expect(
    createClientWithCore(
      {
        integrationName: "test integration",
        integrationVersion: "test integration",
      },
      sharedCore,
    ),
  ).rejects.toThrow(/either `auth`.*or `oidcFetcher`/);
});

test("createClient throws when oidcFetcher is set without workloadDetails", async () => {
  const core = new TestCore();
  const sharedCore = new SharedCore();
  sharedCore.setInner(core);

  await expect(
    createClientWithCore(
      {
        oidcFetcher: async () => "token",
        integrationName: "test integration",
        integrationVersion: "test integration",
      },
      sharedCore,
    ),
  ).rejects.toThrow(/`workloadDetails`/);
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
        "method SecretsResolve called on client 0 with parameters {\"secret_reference\":\"secret_ref\"}",
      );
    });
  });
});

test("createClient with desktop auth rejects without logging when the desktop app isn't found", async () => {
  // Force "not installed", so the test doesn't depend on whether 1Password is on this machine.
  const existsSync = jest.spyOn(fs, "existsSync").mockReturnValue(false);
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    const sharedCore = new SharedCore();
    sharedCore.setInner(new TestCore());

    await expect(
      createClientWithCore(
        {
          auth: new DesktopAuth("my-account"),
          integrationName: "test integration",
          integrationVersion: "test integration",
        },
        sharedCore,
      ),
    ).rejects.toThrow("1Password desktop application not found");

    // The caller handles the error; the SDK doesn't print its own copy (#196).
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    existsSync.mockRestore();
    consoleError.mockRestore();
  }
});
