import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { Core } from "./core";

/**
 * Find the 1Password shared lib path by asking an the wasm core synchronously.
 */
export function find1PasswordLibPath(): string {
  const platform: NodeJS.Platform = os.platform();
  const appRoot: string = path.dirname(process.execPath);
  let searchPaths: string[] = [];

  // Define lists of possible locations for each platform.
  switch (platform) {
    case "darwin": // macOS
      searchPaths = [
        "/Applications/1Password.app/Contents/Frameworks/op-sdk-js-index.node",
        path.join(
          os.homedir(),
          "/Applications/1Password.app/Contents/Frameworks/op-sdk-js-index.node",
        ),
      ];
      break;

    case "win32": // Windows
      searchPaths = [
        "C:/Program Files/1Password/op-sdk-js-index.node",
        "C:/Program Files (x86)/1Password/op-sdk-js-index.node",
        path.join(
          os.homedir(),
          "/AppData/Local/1Password/op-sdk-js-index.node",
        ),
      ];
      break;

    case "linux": // Linux
      searchPaths = [
        "/usr/bin/1password/op-sdk-js-index.node",
        "/opt/1password/op-sdk-js-index.node",
        "/snap/bin/1password/op-sdk-js-index.node",
      ];
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  // Iterate through the possible paths and return the first one that exists.
  for (const addonPath of searchPaths) {
    if (fs.existsSync(addonPath)) {
      return addonPath;
    }
  }

  // If the loop completes without finding the file, throw an error.
  throw new Error("1Password desktop application not found");
}

interface DesktopIPCClient {
  sendMessage(msg: Buffer): Buffer;
}

type SharedLibRequest = {
  kind: string;
  account_name: string;
  payload: string;
};

interface SharedLibResponse {
  success: boolean;
  payload: any; // Can be a string on success or an array of numbers on error
}

/**
 * SharedLibCore: wrapper around the dynamically loaded shared library
 */
export class SharedLibCore implements Core {
  private lib: DesktopIPCClient | null = null;
  private acccountName: string;

  constructor(accountName: string) {
    try {
      const libPath = find1PasswordLibPath();
      const loadedModule = require(libPath);

      // We still need to validate that the module loaded correctly
      if (typeof loadedModule.sendMessage === "function") {
        this.lib = loadedModule as DesktopIPCClient;
      } else {
        console.error(
          "Failed to initialize native library: sendMessage function not found on module.",
        );
        this.lib = null;
      }
    } catch (e) {
      console.error(
        "A critical error occurred while loading the native addon:",
        e,
      );
      this.lib = null;
    }

    this.acccountName = accountName;
  }

  /**
   * callSharedLibrary - send string to native function, receive string back.
   */
  callSharedLibrary(input: string, operation_type: string): string {
    if (!this.lib) {
      throw new Error("Native library is not available.");
    }

    if (!input || input.length === 0) {
      throw new Error("internal: empty input");
    }

    const inputEncoded = Buffer.from(input, "utf8").toString("base64");

    const req = {
      account_name: this.acccountName,
      kind: operation_type,
      payload: inputEncoded,
    } satisfies SharedLibRequest;

    const inputBuf = Buffer.from(JSON.stringify(req), "utf8");
    try {
      const respBuffer = this.lib.sendMessage(inputBuf);

      if (!(respBuffer instanceof Buffer)) {
        throw new Error("Native function returned an unexpected type.");
      }

      const respString = respBuffer.toString("utf8");
      const response: SharedLibResponse = JSON.parse(respString);

      if (response.success) {
        const decodedPayload = Buffer.from(response.payload, "base64").toString(
          "utf8",
        );
        // On success, the payload is the actual result string
        return decodedPayload;
      } else {
        // On failure, convert the error payload to a readable string and throw
        const errorMessage = Array.isArray(response.payload)
          ? String.fromCharCode(...response.payload)
          : JSON.stringify(response.payload);

        throw new Error(`Native library returned an error: ${errorMessage}`);
      }
    } catch (e) {
      // Catch errors from the native call or from JSON parsing
      console.error("An error occurred during the native library call:", e);
      throw e;
    }
  }

  // Core interface implementation
  public async initClient(config: string): Promise<string> {
    return this.callSharedLibrary(config, "init_client");
  }

  public async invoke(invokeConfigBytes: string): Promise<string> {
    return this.callSharedLibrary(invokeConfigBytes, "invoke");
  }

  public releaseClient(clientId: string): void {
    try {
      this.callSharedLibrary(clientId, "release_client");
    } catch (err) {
      console.warn("failed to release client:", err);
    }
  }
}
