import { unwrapLiteral } from "@varavel/vdl-plugin-sdk/utils/ir";
import { indent } from "@varavel/vdl-plugin-sdk/utils/strings";
import type {
  GeneratorContext,
  OperationDescriptor,
} from "../../../model/types";

/**
 * Returns runtime catalog metadata embedded into generated client and server files.
 */
export function renderCatalogSource(context: GeneratorContext): string {
  const procedures = context.procedures
    .map((operation) => `${renderOperationDefinitionLiteral(operation)},`)
    .join("\n");

  const streams = context.streams
    .map((operation) => `${renderOperationDefinitionLiteral(operation)},`)
    .join("\n");

  const paths = context.services
    .map((service) => {
      const operations = service.operations
        .map(
          (operation) =>
            `    ${operation.name}: ${JSON.stringify(`/${operation.rpcName}/${operation.name}`)},`,
        )
        .join("\n");

      return [`  ${service.name}: {`, operations, "  },"].join("\n");
    })
    .join("\n");

  return [
    "/**",
    " * VDLProcedures lists every generated procedure definition with preserved schema metadata.",
    " * Use it for introspection, tracing, and building operation-aware tooling.",
    " */",
    "export const VDLProcedures: OperationDefinition[] = [",
    procedures,
    "] as const;",
    "",
    "/**",
    " * VDLStreams lists every generated stream definition with preserved schema metadata.",
    " * Use it for introspection, tracing, and building operation-aware tooling.",
    " */",
    "export const VDLStreams: OperationDefinition[] = [",
    streams,
    "] as const;",
    "",
    "/**",
    " * VDLPaths maps rpcName -> operationName -> relative URL path.",
    " * Useful when wiring custom transports or inspecting generated routes.",
    " */",
    "export const VDLPaths = {",
    paths,
    "} as const;",
  ].join("\n");
}

/**
 * Renders one catalog entry literal from an operation descriptor.
 */
function renderOperationDefinitionLiteral(
  operation: OperationDescriptor,
): string {
  const annotations = operation.annotations.map((annotation) => ({
    name: annotation.name,
    ...(annotation.argument
      ? { argument: unwrapLiteral<unknown>(annotation.argument) }
      : {}),
  }));

  return indent(
    JSON.stringify(
      {
        rpcName: operation.rpcName,
        name: operation.name,
        type: operation.kind,
        path: `/${operation.rpcName}/${operation.name}`,
        annotations,
      },
      null,
      2,
    ),
  );
}
