import { newGenerator } from "@varavel/gen";
import type { PluginOutputFile } from "@varavel/vdl-plugin-sdk";
import { writeDocComment } from "../../../../shared/comments";
import { renderTypeScriptFile } from "../../../../shared/render-ts-file";
import type {
  GeneratorContext,
  OperationDescriptor,
  ServiceDescriptor,
} from "../../../model/types";
import { renderCatalogSource } from "../shared/catalog";
import { renderCoreSource } from "../shared/core";
import { renderServerRuntimeSource } from "./runtime";

/**
 * Emits the generated server target.
 */
export function generateServerFile(
  context: GeneratorContext,
): PluginOutputFile {
  const g = newGenerator().withSpaces(2);

  g.line(
    `import * as vdlTypes from ${JSON.stringify(context.options.typesImport)};`,
  );
  g.break();

  g.raw(renderCatalogSource(context));
  g.break();
  g.raw(renderCoreSource());
  g.break();
  g.raw(renderServerRuntimeSource());
  g.break();
  renderServerFacade(g, context);

  return {
    path: "server.ts",
    content: renderTypeScriptFile(g.toString()),
  };
}

/**
 * Emits the generated public server API and typed registration wrappers.
 */
function renderServerFacade(
  g: ReturnType<typeof newGenerator>,
  context: GeneratorContext,
): void {
  writeDocComment(g, {
    fallback:
      "Server provides the high-level, type-safe API for building a VDL RPC server.",
  });
  g.line("export class Server<T = unknown> {");
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line("public readonly rpcs: ServerRPCRegistry<T>;");
    g.break();

    g.line("constructor() {");
    g.block(() => {
      g.line(
        "this.intServer = new InternalServer<T>(VDLProcedures, VDLStreams);",
      );
      g.line("this.rpcs = new ServerRPCRegistry<T>(this.intServer);");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Registers a global middleware that runs for every procedure and stream.",
    });
    g.line("use(mw: GlobalMiddlewareFunc<T>): void {");
    g.block(() => {
      g.line("this.intServer.addGlobalMiddleware(mw);");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Sets the global stream configuration for all streams.",
    });
    g.line("setStreamConfig(cfg: StreamConfig): void {");
    g.block(() => {
      g.line("this.intServer.setGlobalStreamConfig(cfg);");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Sets the global error handler used by all RPC services.",
    });
    g.line("setErrorHandler(fn: ErrorHandlerFunc<T>): void {");
    g.block(() => {
      g.line("this.intServer.setGlobalErrorHandler(fn);");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Processes one incoming RPC request using the provided HTTP adapter.",
    });
    g.line("async handleRequest(");
    g.block(() => {
      g.line("props: T,");
      g.line("rpcName: string,");
      g.line("operationName: string,");
      g.line("httpAdapter: HTTPAdapter,");
    });
    g.line("): Promise<void> {");
    g.block(() => {
      g.line(
        "return this.intServer.handleRequest(props, rpcName, operationName, httpAdapter);",
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();

  writeDocComment(g, {
    fallback: "Top-level registry exposing every generated RPC service.",
  });
  g.line("class ServerRPCRegistry<T> {");
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line("constructor(intServer: InternalServer<T>) {");
    g.block(() => {
      g.line("this.intServer = intServer;");
    });
    g.line("}");
    g.break();

    for (const service of context.services) {
      renderServiceAccessor(g, service);
    }
  });
  g.line("}");
  g.break();

  for (const service of context.services) {
    renderServiceClass(g, service);
    renderProcedureRegistry(g, service);
    renderStreamRegistry(g, service);

    for (const procedure of service.procedures) {
      renderProcedureEntry(g, procedure);
    }

    for (const stream of service.streams) {
      renderStreamEntry(g, stream);
    }
  }
}

/**
 * Emits one service accessor on the top-level RPC registry.
 */
function renderServiceAccessor(
  g: ReturnType<typeof newGenerator>,
  service: ServiceDescriptor,
): void {
  writeDocComment(g, {
    doc: service.doc,
    annotations: service.annotations,
    fallback: `Access the ${service.name} RPC service.`,
  });
  g.line(
    `${service.accessorName}(): Server${service.name}RPC<T> { return new Server${service.name}RPC<T>(this.intServer); }`,
  );
  g.break();
}

/**
 * Emits the class that groups one service's procedures and streams.
 */
function renderServiceClass(
  g: ReturnType<typeof newGenerator>,
  service: ServiceDescriptor,
): void {
  writeDocComment(g, {
    doc: service.doc,
    annotations: service.annotations,
    fallback: `Typed registration surface for the ${service.name} RPC service.`,
  });
  g.line(`class Server${service.name}RPC<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(`public readonly procs: Server${service.name}Procs<T>;`);
    g.line(`public readonly streams: Server${service.name}Streams<T>;`);
    g.break();

    g.line("constructor(intServer: InternalServer<T>) {");
    g.block(() => {
      g.line("this.intServer = intServer;");
      g.line(`this.procs = new Server${service.name}Procs<T>(intServer);`);
      g.line(`this.streams = new Server${service.name}Streams<T>(intServer);`);
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Registers a middleware for every ${service.name} operation.`,
    });
    g.line("use(mw: GlobalMiddlewareFunc<T>): void {");
    g.block(() => {
      g.line(
        `this.intServer.addRPCMiddleware(${JSON.stringify(service.name)}, mw);`,
      );
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Sets the default stream configuration for ${service.name}.`,
    });
    g.line("setStreamConfig(cfg: StreamConfig): void {");
    g.block(() => {
      g.line(
        `this.intServer.setRPCStreamConfig(${JSON.stringify(service.name)}, cfg);`,
      );
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Sets an RPC-specific error handler for ${service.name}.`,
    });
    g.line("setErrorHandler(fn: ErrorHandlerFunc<T>): void {");
    g.block(() => {
      g.line(
        `this.intServer.setRPCErrorHandler(${JSON.stringify(service.name)}, fn);`,
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}

/**
 * Emits the typed procedure registry for one service.
 */
function renderProcedureRegistry(
  g: ReturnType<typeof newGenerator>,
  service: ServiceDescriptor,
): void {
  writeDocComment(g, {
    fallback: `Registry exposing every generated procedure entry for ${service.name}.`,
  });
  g.line(`class Server${service.name}Procs<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }",
    );
    g.break();

    for (const procedure of service.procedures) {
      writeDocComment(g, {
        doc: procedure.doc,
        annotations: procedure.annotations,
        fallback: `Registers the ${service.name}.${procedure.name} procedure.`,
      });
      g.line(
        `${procedure.serverMethodName}(): Proc${service.name}${procedure.name}Entry<T> { return new Proc${service.name}${procedure.name}Entry<T>(this.intServer); }`,
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
}

/**
 * Emits the typed stream registry for one service.
 */
function renderStreamRegistry(
  g: ReturnType<typeof newGenerator>,
  service: ServiceDescriptor,
): void {
  writeDocComment(g, {
    fallback: `Registry exposing every generated stream entry for ${service.name}.`,
  });
  g.line(`class Server${service.name}Streams<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }",
    );
    g.break();

    for (const stream of service.streams) {
      writeDocComment(g, {
        doc: stream.doc,
        annotations: stream.annotations,
        fallback: `Registers the ${service.name}.${stream.name} stream.`,
      });
      g.line(
        `${stream.serverMethodName}(): Stream${service.name}${stream.name}Entry<T> { return new Stream${service.name}${stream.name}Entry<T>(this.intServer); }`,
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
}

/**
 * Emits one typed procedure registration entry.
 */
function renderProcedureEntry(
  g: ReturnType<typeof newGenerator>,
  operation: OperationDescriptor,
): void {
  const inputType = renderRuntimeTypeReference(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference(operation.inputTypeName);

  writeDocComment(g, {
    doc: operation.doc,
    annotations: operation.annotations,
    fallback: `Typed procedure registration entry for ${operation.rpcName}.${operation.name}.`,
  });
  g.line(`class Proc${operation.rpcName}${operation.name}Entry<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }",
    );
    g.break();

    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers a typed middleware for ${operation.rpcName}.${operation.name}.`,
    });
    g.line(
      `use(mw: ProcMiddlewareFunc<T, ${inputType}, ${outputType}>): void {`,
    );
    g.block(() => {
      g.line("const adapted: ProcMiddlewareFunc<T, any, any> = (next) => {");
      g.block(() => {
        g.line("return async (cGeneric) => {");
        g.block(() => {
          g.line(
            `const typedNext: ProcHandlerFunc<T, ${inputType}, ${outputType}> = async (c) => {`,
          );
          g.block(() => {
            g.line("cGeneric.props = c.props;");
            g.line("cGeneric.input = c.input;");
            g.line(`return (await next(cGeneric)) as ${outputType};`);
          });
          g.line("};");
          g.line("const typedChain = mw(typedNext);");
          g.line(
            `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`,
          );
          g.line("return typedChain(cSpecific);");
        });
        g.line("};");
      });
      g.line("};");
      g.line(
        `this.intServer.addProcMiddleware(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adapted);`,
      );
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers the business handler for ${operation.rpcName}.${operation.name}.`,
    });
    g.line(
      `handle(handler: ProcHandlerFunc<T, ${inputType}, ${outputType}>): void {`,
    );
    g.block(() => {
      g.line(
        "const adaptedHandler: ProcHandlerFunc<T, any, any> = async (cGeneric) => {",
      );
      g.block(() => {
        g.line(
          `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`,
        );
        g.line("return handler(cSpecific);");
      });
      g.line("};");
      g.break();
      g.line("const deserializer: DeserializerFunc = async (raw) => {");
      g.block(() => {
        g.line(`const error = ${inputHelper}.validate(raw);`);
        g.line("if (error !== null) {");
        g.block(() => {
          g.line(
            'throw new VdlError({ message: error, code: "INVALID_INPUT", category: "ValidationError" });',
          );
        });
        g.line("}");
        g.line(`return ${inputHelper}.hydrate(raw as ${inputType});`);
      });
      g.line("};");
      g.line(
        `this.intServer.setProcHandler(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adaptedHandler, deserializer);`,
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}

/**
 * Emits one typed stream registration entry.
 */
function renderStreamEntry(
  g: ReturnType<typeof newGenerator>,
  operation: OperationDescriptor,
): void {
  const inputType = renderRuntimeTypeReference(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference(operation.inputTypeName);

  writeDocComment(g, {
    doc: operation.doc,
    annotations: operation.annotations,
    fallback: `Typed stream registration entry for ${operation.rpcName}.${operation.name}.`,
  });
  g.line(`class Stream${operation.rpcName}${operation.name}Entry<T> {`);
  g.block(() => {
    g.line("private readonly intServer: InternalServer<T>;");
    g.line(
      "constructor(intServer: InternalServer<T>) { this.intServer = intServer; }",
    );
    g.break();

    writeDocComment(g, {
      fallback: `Sets the stream configuration for ${operation.rpcName}.${operation.name}.`,
    });
    g.line("setConfig(cfg: StreamConfig): void {");
    g.block(() => {
      g.line(
        `this.intServer.setStreamConfig(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, cfg);`,
      );
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers a typed middleware for ${operation.rpcName}.${operation.name}.`,
    });
    g.line(
      `use(mw: StreamMiddlewareFunc<T, ${inputType}, ${outputType}>): void {`,
    );
    g.block(() => {
      g.line("const adapted: StreamMiddlewareFunc<T, any, any> = (next) => {");
      g.block(() => {
        g.line("return async (cGeneric, emitGeneric) => {");
        g.block(() => {
          g.line(
            `const typedNext: StreamHandlerFunc<T, ${inputType}, ${outputType}> = async (c, emit) => {`,
          );
          g.block(() => {
            g.line("cGeneric.props = c.props;");
            g.line("cGeneric.input = c.input;");
            g.line("return next(cGeneric, emitGeneric);");
          });
          g.line("};");
          g.line("const typedChain = mw(typedNext);");
          g.line(
            `const emitSpecific: EmitFunc<T, ${inputType}, ${outputType}> = async (_c, output) => emitGeneric(cGeneric, output);`,
          );
          g.line(
            `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`,
          );
          g.line("return typedChain(cSpecific, emitSpecific);");
        });
        g.line("};");
      });
      g.line("};");
      g.line(
        `this.intServer.addStreamMiddleware(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adapted);`,
      );
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Registers a typed emit middleware for ${operation.rpcName}.${operation.name}.`,
    });
    g.line(
      `useEmit(mw: EmitMiddlewareFunc<T, ${inputType}, ${outputType}>): void {`,
    );
    g.block(() => {
      g.line("const adapted: EmitMiddlewareFunc<T, any, any> = (next) => {");
      g.block(() => {
        g.line("return async (cGeneric, outputGeneric) => {");
        g.block(() => {
          g.line(
            `const typedNext: EmitFunc<T, ${inputType}, ${outputType}> = async (c, output) => {`,
          );
          g.block(() => {
            g.line("cGeneric.props = c.props;");
            g.line("cGeneric.input = c.input;");
            g.line("return next(cGeneric, output);");
          });
          g.line("};");
          g.line("const emitChain = mw(typedNext);");
          g.line(
            `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`,
          );
          g.line(
            `return emitChain(cSpecific, outputGeneric as ${outputType});`,
          );
        });
        g.line("};");
      });
      g.line("};");
      g.line(
        `this.intServer.addStreamEmitMiddleware(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adapted);`,
      );
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Registers the business handler for ${operation.rpcName}.${operation.name}.`,
    });
    g.line(
      `handle(handler: StreamHandlerFunc<T, ${inputType}, ${outputType}>): void {`,
    );
    g.block(() => {
      g.line(
        "const adaptedHandler: StreamHandlerFunc<T, any, any> = async (cGeneric, emitGeneric) => {",
      );
      g.block(() => {
        g.line(
          `const emitSpecific: EmitFunc<T, ${inputType}, ${outputType}> = async (_c, output) => emitGeneric(cGeneric, output);`,
        );
        g.line(
          `const cSpecific = new HandlerContext<T, ${inputType}>(cGeneric.props, cGeneric.input as ${inputType}, cGeneric.signal, cGeneric.operation);`,
        );
        g.line("return handler(cSpecific, emitSpecific);");
      });
      g.line("};");
      g.break();
      g.line("const deserializer: DeserializerFunc = async (raw) => {");
      g.block(() => {
        g.line(`const error = ${inputHelper}.validate(raw);`);
        g.line("if (error !== null) {");
        g.block(() => {
          g.line(
            'throw new VdlError({ message: error, code: "INVALID_INPUT", category: "ValidationError" });',
          );
        });
        g.line("}");
        g.line(`return ${inputHelper}.hydrate(raw as ${inputType});`);
      });
      g.line("};");
      g.line(
        `this.intServer.setStreamHandler(${JSON.stringify(operation.rpcName)}, ${JSON.stringify(operation.name)}, adaptedHandler, deserializer);`,
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}

/**
 * Returns the runtime type reference used in generated server signatures.
 */
function renderRuntimeTypeReference(typeName?: string): string {
  return typeName ? `vdlTypes.${typeName}` : "Void";
}

/**
 * Returns the runtime helper reference used for validation and hydration.
 */
function renderRuntimeHelperReference(typeName?: string): string {
  return typeName ? `vdlTypes.${typeName}` : "Void";
}
