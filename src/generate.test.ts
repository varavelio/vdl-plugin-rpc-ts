import {
  annotation,
  field,
  objectLiteral,
  objectType,
  pluginInput,
  primitiveType,
  schema,
  stringLiteral,
  typeDef,
} from "@varavel/vdl-plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import { generate } from "./generate";

function createBaseInput() {
  return pluginInput({
    ir: schema({
      types: [
        typeDef(
          "Messages",
          objectType([
            field(
              "sendMessage",
              objectType([
                field(
                  "input",
                  objectType([
                    field("roomId", primitiveType("string")),
                    field("text", primitiveType("string")),
                  ]),
                ),
                field(
                  "output",
                  objectType([field("accepted", primitiveType("bool"))]),
                ),
              ]),
              {
                annotations: [
                  annotation("proc"),
                  annotation(
                    "cache",
                    objectLiteral({ scope: stringLiteral("room") }),
                  ),
                ],
              },
            ),
            field(
              "events",
              objectType([
                field(
                  "input",
                  objectType([field("roomId", primitiveType("string"))]),
                ),
                field(
                  "output",
                  objectType([field("text", primitiveType("string"))]),
                ),
              ]),
              {
                annotations: [annotation("stream")],
              },
            ),
          ]),
          {
            annotations: [annotation("rpc")],
          },
        ),
      ],
    }),
    options: {
      typesImport: "../types/index.js",
      importExtension: "ts",
    },
  });
}

describe("generate", () => {
  it("generates the client target", () => {
    const output = generate({
      ...createBaseInput(),
      options: {
        ...createBaseInput().options,
        target: "client",
      },
    });

    expect(output.errors).toBeUndefined();
    expect(output.files?.map((file) => file.path)).toEqual(["client.ts"]);
    expect(fileContent(output, "client.ts")).toContain(
      'import * as vdlTypes from "../types/index.js";',
    );
    expect(fileContent(output, "client.ts")).toContain(
      "export const VDLProcedures: OperationDefinition[] = [",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "public readonly rpcs: ClientRPCRegistry;",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "messages(): ClientMessagesRPC",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "public readonly procs: ClientMessagesProcs;",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "sendMessage(): ProcMessagessendMessageBuilder",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "withRetries(config: Partial<RetryConfig>)",
    );
    expect(fileContent(output, "client.ts")).toContain('"name": "cache"');
    expect(fileContent(output, "client.ts")).toContain(
      "private verifyRuntimeDeps()",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "private rpcHeaderProviders: Map<string, HeaderProvider[]> = new Map();",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "private rpcRetryConf: Map<string, RetryConfig> = new Map();",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "setRPCRetryConfig(rpcName: string, conf: RetryConfig)",
    );
    expect(fileContent(output, "client.ts")).toContain(
      "setRPCHeaderProvider(rpcName: string, provider: HeaderProvider)",
    );
    expect(fileContent(output, "client.ts")).toContain(
      'this.intClient.setRPCRetryConfig("Messages", normalizeRetryConfig(config, 3));',
    );
  });

  it("generates the server target", () => {
    const output = generate({
      ...createBaseInput(),
      options: {
        ...createBaseInput().options,
        target: "server",
      },
    });

    expect(output.errors).toBeUndefined();
    expect(output.files?.map((file) => file.path)).toEqual([
      "server.ts",
      "adapters/node.ts",
      "adapters/fetch.ts",
    ]);
    expect(fileContent(output, "server.ts")).toContain(
      "get annotations(): OperationAnnotation[]",
    );
    expect(fileContent(output, "server.ts")).toContain(
      "export const VDLStreams: OperationDefinition[] = [",
    );
    expect(fileContent(output, "server.ts")).toContain(
      "HTTPAdapter defines the interface required by VDL server to handle",
    );
    expect(fileContent(output, "adapters/node.ts")).toContain(
      "createNodeHandler",
    );
    expect(fileContent(output, "adapters/node.ts")).toContain(
      "NodeAdapter implements HTTPAdapter for Node.js HTTP environments.",
    );
    expect(fileContent(output, "adapters/fetch.ts")).toContain(
      "FetchAdapter implements HTTPAdapter for Web Standards environments.",
    );
  });

  it("throws SDK RPC validation errors before modeling", () => {
    expect(() =>
      generate(
        pluginInput({
          ir: schema({
            types: [
              typeDef(
                "Broken",
                objectType([
                  field(
                    "oops",
                    objectType([field("input", primitiveType("string"))]),
                    {
                      annotations: [annotation("proc")],
                    },
                  ),
                ]),
                {
                  annotations: [annotation("rpc")],
                },
              ),
            ],
          }),
          options: {
            target: "server",
            typesImport: "../types/index.js",
          },
        }),
      ),
    ).toThrowError(
      'Field "input" in operation "Broken.oops" must be an object type when present.',
    );
  });

  it("emits no files when the schema has no RPC operations", () => {
    const output = generate(
      pluginInput({
        options: {
          target: "client",
          typesImport: "../types/index.js",
        },
        ir: schema({
          types: [
            typeDef("User", objectType([field("id", primitiveType("string"))])),
          ],
        }),
      }),
    );

    expect(output.errors).toBeUndefined();
    expect(output.files).toEqual([]);
  });
});

function fileContent(
  result: ReturnType<typeof generate>,
  path: string,
): string {
  const file = result.files?.find((entry) => entry.path === path);
  expect(file).toBeDefined();
  return file?.content ?? "";
}
