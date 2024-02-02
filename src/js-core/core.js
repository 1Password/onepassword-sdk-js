import * as wasm from "./core_bg.wasm";
import { __wbg_set_wasm } from "./core_bg.js";
__wbg_set_wasm(wasm);
export * from "./core_bg.js";
