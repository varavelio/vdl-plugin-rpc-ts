import type { PluginOutputFile } from "@varavel/vdl-plugin-sdk";
import * as arrays from "@varavel/vdl-plugin-sdk/utils/arrays";
import type { GeneratorContext } from "../model/types";
import { generateClientFile } from "./files/client/generate";
import { generateFetchAdapterFile } from "./files/server/fetch-adapter";
import { generateServerFile } from "./files/server/generate";
import { generateNodeAdapterFile } from "./files/server/node-adapter";

/**
 * Emits the target-specific TypeScript source files for the prepared RPC context.
 */
export function generateFiles(context: GeneratorContext): PluginOutputFile[] {
  if (context.procedures.length === 0 && context.streams.length === 0) {
    return [];
  }

  return arrays.compact([
    context.options.target === "client"
      ? generateClientFile(context)
      : generateServerFile(context),
    context.options.target === "server"
      ? generateNodeAdapterFile(context)
      : undefined,
    context.options.target === "server"
      ? generateFetchAdapterFile(context)
      : undefined,
  ]);
}
