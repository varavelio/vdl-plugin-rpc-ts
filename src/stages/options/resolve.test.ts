import * as irb from "@varavel/vdl-plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import { resolveGeneratorOptions } from "./resolve";

describe("resolveGeneratorOptions", () => {
  it("accepts required options and defaults importExtension to js", () => {
    const result = resolveGeneratorOptions(
      irb.pluginInput({
        options: {
          target: "client",
          typesImport: "../types/index.js",
        },
      }),
    );

    expect(result.errors).toEqual([]);
    expect(result.options).toEqual({
      target: "client",
      typesImport: "../types/index.js",
      importExtension: "js",
    });
  });

  it("reports missing required options", () => {
    const result = resolveGeneratorOptions(irb.pluginInput());

    expect(result.options).toBeUndefined();
    expect(result.errors).toEqual([
      expect.objectContaining({
        message: expect.stringContaining("typesImport"),
      }),
      expect.objectContaining({ message: expect.stringContaining("target") }),
    ]);
  });

  it("reports invalid import extensions", () => {
    const result = resolveGeneratorOptions(
      irb.pluginInput({
        options: {
          target: "server",
          typesImport: "../types/index.js",
          importExtension: "mjs",
        },
      }),
    );

    expect(result.options).toBeUndefined();
    expect(result.errors).toEqual([
      expect.objectContaining({
        message: expect.stringContaining("importExtension"),
      }),
    ]);
  });
});
