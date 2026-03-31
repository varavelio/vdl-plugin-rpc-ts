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
import { createGeneratorContext } from "./build-context";

describe("createGeneratorContext", () => {
  it("models annotation-based RPC services and operations", () => {
    const result = createGeneratorContext({
      input: pluginInput({
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
                      objectType([field("text", primitiveType("string"))]),
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
              ]),
              {
                annotations: [annotation("rpc")],
              },
            ),
          ],
        }),
      }),
      generatorOptions: {
        target: "client",
        typesImport: "../types/index.js",
        importExtension: "js",
      },
    });

    expect(result.errors).toEqual([]);
    expect(result.context?.services).toHaveLength(1);
    expect(result.context?.procedures).toHaveLength(1);
    expect(result.context?.streams).toHaveLength(0);

    const service = result.context?.services[0];
    const operation = result.context?.procedures[0];

    expect(service).toMatchObject({
      name: "Messages",
      accessorName: "messages",
    });
    expect(operation).toMatchObject({
      rpcName: "Messages",
      rpcAccessorName: "messages",
      name: "sendMessage",
      clientMethodName: "messagesSendMessage",
      serverMethodName: "sendMessage",
      operationTypeName: "MessagesSendMessage",
      inputTypeName: "MessagesSendMessageInput",
      outputTypeName: "MessagesSendMessageOutput",
      streamResponseTypeName: "MessagesSendMessageResponse",
    });
    expect(operation?.annotations.map((item) => item.name)).toEqual(["cache"]);
  });

  it("allows operations that omit input and output", () => {
    const result = createGeneratorContext({
      input: pluginInput({
        ir: schema({
          types: [
            typeDef(
              "Commands",
              objectType([
                field("ping", objectType([]), {
                  annotations: [annotation("proc")],
                }),
              ]),
              {
                annotations: [annotation("rpc")],
              },
            ),
          ],
        }),
      }),
      generatorOptions: {
        target: "server",
        typesImport: "../types/index.js",
        importExtension: "ts",
      },
    });

    expect(result.errors).toEqual([]);
    expect(result.context?.procedures[0]).toMatchObject({
      name: "ping",
      inputTypeName: undefined,
      outputTypeName: undefined,
    });
  });
});
