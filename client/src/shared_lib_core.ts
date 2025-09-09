import * as fs from "fs";
import * as os from "os";
import * as ffi from "ffi-napi";
import * as ref from "ref-napi";

import { invoke_sync } from "@1password/sdk-core";
import { Core, InvokeConfig } from "./core";

// C/ref types
const uint8 = ref.types.uint8;
const size_t = ref.types.size_t;
const int32 = ref.types.int32;
const voidType = ref.types.void;
const uint8Ptr = ref.refType(uint8);
const uint8PtrPtr = ref.refType(uint8Ptr);

/**
 * Find the 1Password shared lib path by asking an the wasm core synchronously.
 */
export function find1PasswordLibPath(): string {
  const hostOS = os.platform(); // 'darwin'|'linux'|'win32'
  const invocationConfig: InvokeConfig = {
    invocation: {
      parameters: {
        name: "GetDesktopAppIpcClientLocations",
        parameters: {
          host_os: hostOS,
        },
      },
    },
  };
  try {
    const serializedConfig = JSON.stringify(invocationConfig);
    const locationsRaw = invoke_sync(serializedConfig);
    const locations = JSON.parse(locationsRaw) as string[];
    for (const p of locations) {
      if (fs.existsSync(p)) return p;
    }
  } catch (err) {
    throw new Error("1Password desktop application not found");
  }
}

/**
 * SharedLibCore: wrapper around the dynamically loaded shared library
 */
export class SharedLibCore implements Core {
  private lib: any; // ffi.Library instance
  private sendMessage: any;
  private freeResponse: any;

  constructor() {
    const libPath = find1PasswordLibPath();

    // Load the library. 'ffi.Library' will wrap symbol lookups.
    this.lib = ffi.Library(libPath, {
      // int32_t op_sdk_ipc_send_message(const uint8_t* msg_ptr, size_t msg_len,
      //     uint8_t** out_buf, size_t* out_len, size_t* out_cap);
      op_sdk_ipc_send_message: [
        int32,
        [
          uint8Ptr,
          size_t,
          uint8PtrPtr,
          ref.refType(size_t),
          ref.refType(size_t),
        ],
      ],

      // void op_sdk_ipc_free_response(uint8_t* buf, size_t len, size_t cap)
      op_sdk_ipc_free_response: [voidType, [uint8Ptr, size_t, size_t]],
    });

    this.sendMessage = this.lib.op_sdk_ipc_send_message;
    this.freeResponse = this.lib.op_sdk_ipc_free_response;
  }

  /**
   * callSharedLibrary - send string to native function, receive string back.
   */
  callSharedLibrary(input: string): string {
    if (!input || input.length === 0) {
      throw new Error("internal: empty input");
    }

    const outBufPtr = ref.alloc(uint8Ptr); // pointer to uint8*
    const outLenPtr = ref.alloc(size_t);
    const outCapPtr = ref.alloc(size_t);

    const inputBuf = Buffer.from(input, "utf8");

    const retCode: number = this.sendMessage(
      inputBuf,
      inputBuf.length,
      outBufPtr,
      outLenPtr,
      outCapPtr,
    );

    if (retCode !== 0) {
      throw new Error(`failed to send message to OPH. Return code: ${retCode}`);
    }

    // TS typing quirk: deref() is typed poorly in @types/ref-napi; coerce to unknown -> Buffer
    // at runtime this is a pointer-like object that ref.reinterpret accepts.
    const outBufPtrValue = outBufPtr.deref() as unknown as Buffer;
    const outLen = outLenPtr.deref() as number;
    const outCap = outCapPtr.deref() as number;

    if (!outBufPtrValue || outLen === 0) {
      if (outBufPtrValue) {
        // reinterpret the pointer (0 length) into a Buffer to satisfy ffi/ref signature
        const emptyBuf = ref.reinterpret(outBufPtrValue, 0, 0);
        this.freeResponse(emptyBuf, outLen, outCap);
      }
      return "";
    }

    // reinterpret the pointer into a Buffer view of length outLen
    const outBuf = ref.reinterpret(outBufPtrValue, outLen, 0);

    // Copy into JS-owned memory
    const data = Buffer.from(outBuf);

    // Free Rust buffer (must pass a Buffer/pointer, not a raw number)
    this.freeResponse(outBuf, outLen, outCap);

    return data.toString("utf8");
  }

  // Core interface implementation
  public async initClient(config: string): Promise<string> {
    return this.callSharedLibrary(config);
  }

  public async invoke(invokeConfigBytes: string): Promise<string> {
    return this.callSharedLibrary(invokeConfigBytes);
  }

  public releaseClient(clientId: string): void {
    try {
      this.callSharedLibrary(clientId);
    } catch (err) {
      console.warn("failed to release client:", err);
    }
  }
}
