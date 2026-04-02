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

    expect(result).toEqual({
      target: "client",
      typesImport: "../types/index.js",
      importExtension: "js",
    });
  });

  it("fails when required options are missing", () => {
    expect(() => resolveGeneratorOptions(irb.pluginInput())).toThrowError(
      /typesImport/,
    );
  });

  it("fails on invalid import extensions", () => {
    expect(() =>
      resolveGeneratorOptions(
        irb.pluginInput({
          options: {
            target: "server",
            typesImport: "../types/index.js",
            importExtension: "mjs",
          },
        }),
      ),
    ).toThrowError(/importExtension/);
  });
});
