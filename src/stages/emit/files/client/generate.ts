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
import { renderClientRuntimeSource } from "./runtime";

/**
 * Emits the generated client target.
 */
export function generateClientFile(
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
  g.raw(renderClientRuntimeSource());
  g.break();
  renderClientFacade(g, context);

  return {
    path: "client.ts",
    content: renderTypeScriptFile(g.toString()),
  };
}

/**
 * Emits the generated public client API and typed operation builders.
 */
function renderClientFacade(
  g: ReturnType<typeof newGenerator>,
  context: GeneratorContext,
): void {
  writeDocComment(g, {
    fallback: "Creates a new VDL RPC client builder.",
  });
  g.line("export function NewClient(baseURL: string): ClientBuilder {");
  g.block(() => {
    g.line("return new ClientBuilder(baseURL);");
  });
  g.line("}");
  g.break();

  writeDocComment(g, {
    fallback: "Fluent builder for configuring a generated RPC client.",
  });
  g.line("export class ClientBuilder {");
  g.block(() => {
    g.line("private readonly builder: clientBuilder;");
    g.break();

    g.line("constructor(baseURL: string) {");
    g.block(() => {
      g.line(
        "this.builder = new clientBuilder(baseURL, VDLProcedures, VDLStreams);",
      );
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Sets a custom fetch implementation for the generated client.",
    });
    g.line("withCustomFetch(fetchFn: FetchLike): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withFetch(fetchFn);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Adds a static header that will be sent with every request.",
    });
    g.line("withGlobalHeader(key: string, value: string): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalHeader(key, value);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Adds a dynamic header provider that runs before every request attempt.",
    });
    g.line("withHeaderProvider(provider: HeaderProvider): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withHeaderProvider(provider);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Adds an interceptor around generated client execution.",
    });
    g.line("withInterceptor(interceptor: Interceptor): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withInterceptor(interceptor);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Sets the global default retry policy for generated procedures.",
    });
    g.line("withGlobalRetryConfig(conf: RetryConfig): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalRetryConfig(conf);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Sets the global default timeout for generated procedures.",
    });
    g.line("withGlobalTimeoutConfig(conf: TimeoutConfig): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalTimeoutConfig(conf);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Sets the global default reconnect policy for generated streams.",
    });
    g.line("withGlobalReconnectConfig(conf: ReconnectConfig): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalReconnectConfig(conf);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Sets the global maximum stream message size.",
    });
    g.line("withGlobalMaxMessageSize(size: number): ClientBuilder {");
    g.block(() => {
      g.line("this.builder.withGlobalMaxMessageSize(size);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Builds the configured client instance.",
    });
    g.line("build(): Client {");
    g.block(() => {
      g.line("return new Client(this.builder.build());");
    });
    g.line("}");
  });
  g.line("}");
  g.break();

  writeDocComment(g, {
    fallback:
      "Main VDL RPC client exposing typed access to generated procedures and streams.",
  });
  g.line("export class Client {");
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("public readonly rpcs: ClientRPCRegistry;");
    g.line("public readonly procs: ProcRegistry;");
    g.line("public readonly streams: StreamRegistry;");
    g.break();

    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
      g.line("this.rpcs = new ClientRPCRegistry(intClient);");
      g.line("this.procs = new ProcRegistry(intClient);");
      g.line("this.streams = new StreamRegistry(intClient);");
    });
    g.line("}");
  });
  g.line("}");
  g.break();

  renderRPCRegistry(g, context);
  renderProcedureRegistry(g, context);
  renderStreamRegistry(g, context);
}

/**
 * Emits the top-level RPC registry for the generated client.
 */
function renderRPCRegistry(
  g: ReturnType<typeof newGenerator>,
  context: GeneratorContext,
): void {
  writeDocComment(g, {
    fallback: "Registry exposing every generated RPC service.",
  });
  g.line("export class ClientRPCRegistry {");
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
    });
    g.line("}");
    g.break();

    for (const service of context.services) {
      writeDocComment(g, {
        doc: service.doc,
        annotations: service.annotations,
        fallback: `Access the ${service.name} RPC service.`,
      });
      g.line(
        `${service.accessorName}(): Client${service.name}RPC { return new Client${service.name}RPC(this.intClient); }`,
      );
      g.break();
    }
  });
  g.line("}");
  g.break();

  for (const service of context.services) {
    renderRPCClientClass(g, service);
    renderRPCProcedureRegistry(g, service);
    renderRPCStreamRegistry(g, service);
  }
}

/**
 * Emits one client-side RPC service accessor with per-RPC configuration.
 */
function renderRPCClientClass(
  g: ReturnType<typeof newGenerator>,
  service: ServiceDescriptor,
): void {
  writeDocComment(g, {
    doc: service.doc,
    annotations: service.annotations,
    fallback: `Client-side access point for the ${service.name} RPC service and its defaults.`,
  });
  g.line(`export class Client${service.name}RPC {`);
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line(`public readonly procs: Client${service.name}Procs;`);
    g.line(`public readonly streams: Client${service.name}Streams;`);
    g.break();

    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
      g.line(`this.procs = new Client${service.name}Procs(intClient);`);
      g.line(`this.streams = new Client${service.name}Streams(intClient);`);
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Adds a static default header for every ${service.name} request.`,
    });
    g.line(
      `withHeader(key: string, value: string): Client${service.name}RPC {`,
    );
    g.block(() => {
      g.line(
        `this.intClient.setRPCHeaderProvider(${JSON.stringify(service.name)}, (headers) => { headers[key] = value; });`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Adds a dynamic default header provider for every ${service.name} request.`,
    });
    g.line(
      `withHeaderProvider(provider: HeaderProvider): Client${service.name}RPC {`,
    );
    g.block(() => {
      g.line(
        `this.intClient.setRPCHeaderProvider(${JSON.stringify(service.name)}, provider);`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Sets the default retry policy for procedures in ${service.name}.`,
    });
    g.line(
      `withRetries(config: Partial<RetryConfig>): Client${service.name}RPC {`,
    );
    g.block(() => {
      g.line(
        `this.intClient.setRPCRetryConfig(${JSON.stringify(service.name)}, normalizeRetryConfig(config, 3));`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(`withRetryConfig(config: RetryConfig): Client${service.name}RPC {`);
    g.block(() => {
      g.line(
        `this.intClient.setRPCRetryConfig(${JSON.stringify(service.name)}, normalizeRetryConfig(config, config.maxAttempts));`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Sets the default timeout policy for procedures in ${service.name}.`,
    });
    g.line(
      `withTimeout(config: Partial<TimeoutConfig>): Client${service.name}RPC {`,
    );
    g.block(() => {
      g.line(
        `this.intClient.setRPCTimeoutConfig(${JSON.stringify(service.name)}, normalizeTimeoutConfig(config));`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withTimeoutConfig(config: TimeoutConfig): Client${service.name}RPC {`,
    );
    g.block(() => {
      g.line(
        `this.intClient.setRPCTimeoutConfig(${JSON.stringify(service.name)}, normalizeTimeoutConfig(config));`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Sets the default reconnect policy for streams in ${service.name}.`,
    });
    g.line(
      `withReconnect(config: Partial<ReconnectConfig>): Client${service.name}RPC {`,
    );
    g.block(() => {
      g.line(
        `this.intClient.setRPCReconnectConfig(${JSON.stringify(service.name)}, normalizeReconnectConfig(config, 5));`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withReconnectConfig(config: ReconnectConfig): Client${service.name}RPC {`,
    );
    g.block(() => {
      g.line(
        `this.intClient.setRPCReconnectConfig(${JSON.stringify(service.name)}, normalizeReconnectConfig(config, config.maxAttempts));`,
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: `Sets the default maximum stream message size for ${service.name}.`,
    });
    g.line(`withMaxMessageSize(size: number): Client${service.name}RPC {`);
    g.block(() => {
      g.line(
        `this.intClient.setRPCMaxMessageSize(${JSON.stringify(service.name)}, size);`,
      );
      g.line("return this;");
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}

/**
 * Emits the procedure registry for one RPC service.
 */
function renderRPCProcedureRegistry(
  g: ReturnType<typeof newGenerator>,
  service: ServiceDescriptor,
): void {
  writeDocComment(g, {
    fallback: `Registry exposing every generated procedure builder for ${service.name}.`,
  });
  g.line(`export class Client${service.name}Procs {`);
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
    });
    g.line("}");
    g.break();

    for (const procedure of service.procedures) {
      writeDocComment(g, {
        doc: procedure.doc,
        annotations: procedure.annotations,
        fallback: `Creates a call builder for ${service.name}.${procedure.name}.`,
      });
      g.line(
        `${procedure.serverMethodName}(): Proc${procedure.rpcName}${procedure.name}Builder { return new Proc${procedure.rpcName}${procedure.name}Builder(this.intClient, ${JSON.stringify(procedure.rpcName)}, ${JSON.stringify(procedure.name)}); }`,
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
}

/**
 * Emits the stream registry for one RPC service.
 */
function renderRPCStreamRegistry(
  g: ReturnType<typeof newGenerator>,
  service: ServiceDescriptor,
): void {
  writeDocComment(g, {
    fallback: `Registry exposing every generated stream builder for ${service.name}.`,
  });
  g.line(`export class Client${service.name}Streams {`);
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
    });
    g.line("}");
    g.break();

    for (const stream of service.streams) {
      writeDocComment(g, {
        doc: stream.doc,
        annotations: stream.annotations,
        fallback: `Creates a stream builder for ${service.name}.${stream.name}.`,
      });
      g.line(
        `${stream.serverMethodName}(): Stream${stream.rpcName}${stream.name}Builder { return new Stream${stream.rpcName}${stream.name}Builder(this.intClient, ${JSON.stringify(stream.rpcName)}, ${JSON.stringify(stream.name)}); }`,
      );
      g.break();
    }
  });
  g.line("}");
  g.break();
}

/**
 * Emits the flattened procedure registry.
 */
function renderProcedureRegistry(
  g: ReturnType<typeof newGenerator>,
  context: GeneratorContext,
): void {
  writeDocComment(g, {
    fallback: "Registry exposing every generated procedure builder.",
  });
  g.line("class ProcRegistry {");
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
    });
    g.line("}");
    g.break();

    for (const procedure of context.procedures) {
      writeDocComment(g, {
        doc: procedure.doc,
        annotations: procedure.annotations,
        fallback: `Creates a call builder for ${procedure.rpcName}.${procedure.name}.`,
      });
      g.line(
        `${procedure.clientMethodName}(): Proc${procedure.rpcName}${procedure.name}Builder { return new Proc${procedure.rpcName}${procedure.name}Builder(this.intClient, ${JSON.stringify(procedure.rpcName)}, ${JSON.stringify(procedure.name)}); }`,
      );
      g.break();
    }
  });
  g.line("}");
  g.break();

  for (const procedure of context.procedures) {
    renderProcedureBuilder(g, procedure);
  }
}

/**
 * Emits the flattened stream registry.
 */
function renderStreamRegistry(
  g: ReturnType<typeof newGenerator>,
  context: GeneratorContext,
): void {
  writeDocComment(g, {
    fallback: "Registry exposing every generated stream builder.",
  });
  g.line("class StreamRegistry {");
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("constructor(intClient: internalClient) {");
    g.block(() => {
      g.line("this.intClient = intClient;");
    });
    g.line("}");
    g.break();

    for (const stream of context.streams) {
      writeDocComment(g, {
        doc: stream.doc,
        annotations: stream.annotations,
        fallback: `Creates a stream builder for ${stream.rpcName}.${stream.name}.`,
      });
      g.line(
        `${stream.clientMethodName}(): Stream${stream.rpcName}${stream.name}Builder { return new Stream${stream.rpcName}${stream.name}Builder(this.intClient, ${JSON.stringify(stream.rpcName)}, ${JSON.stringify(stream.name)}); }`,
      );
      g.break();
    }
  });
  g.line("}");
  g.break();

  for (const stream of context.streams) {
    renderStreamBuilder(g, stream);
  }
}

/**
 * Returns the runtime type reference used in generated client signatures.
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

/**
 * Emits one typed procedure builder.
 */
function renderProcedureBuilder(
  g: ReturnType<typeof newGenerator>,
  operation: OperationDescriptor,
): void {
  const inputType = renderRuntimeTypeReference(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference(operation.inputTypeName);
  const outputHelper = renderRuntimeHelperReference(operation.outputTypeName);
  const executeSignature = operation.inputTypeName
    ? `async execute(input: ${inputType}): Promise<${outputType}>`
    : `async execute(input: Void = {}): Promise<${outputType}>`;

  g.line(`class Proc${operation.rpcName}${operation.name}Builder {`);
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("private readonly rpcName: string;");
    g.line("private readonly procName: string;");
    g.line("private readonly headerProviders: HeaderProvider[] = [];");
    g.line("private retryConfig?: RetryConfig;");
    g.line("private timeoutConfig?: TimeoutConfig;");
    g.line("private signal?: AbortSignal;");
    g.break();

    g.line(
      "constructor(intClient: internalClient, rpcName: string, procName: string) {",
    );
    g.block(() => {
      g.line("this.intClient = intClient;");
      g.line("this.rpcName = rpcName;");
      g.line("this.procName = procName;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Adds a static header to this procedure call.",
    });
    g.line(
      `withHeader(key: string, value: string): Proc${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line(
        "this.headerProviders.push((headers) => { headers[key] = value; });",
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Adds a dynamic header provider to this procedure call. The provider runs on every attempt, including retries.",
    });
    g.line(
      `withHeaderProvider(provider: HeaderProvider): Proc${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.headerProviders.push(provider);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Configures retry behavior for this procedure call. The optional shouldRetry callback receives the resolved operation metadata, including annotations.",
    });
    g.line(
      `withRetries(config: Partial<RetryConfig>): Proc${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.retryConfig = normalizeRetryConfig(config, 3);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withRetryConfig(config: RetryConfig): Proc${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line(
        "this.retryConfig = normalizeRetryConfig(config, config.maxAttempts);",
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Configures timeout behavior for this procedure call.",
    });
    g.line(
      `withTimeout(config: Partial<TimeoutConfig>): Proc${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.timeoutConfig = normalizeTimeoutConfig(config);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withTimeoutConfig(config: TimeoutConfig): Proc${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.timeoutConfig = normalizeTimeoutConfig(config);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Sets an external AbortSignal used to cancel this procedure call.",
    });
    g.line(
      `withSignal(signal: AbortSignal): Proc${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.signal = signal;");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Executes ${operation.rpcName}.${operation.name}.`,
    });
    g.line(`${executeSignature} {`);
    g.block(() => {
      g.line(`const validationError = ${inputHelper}.validate(input);`);
      g.line("if (validationError !== null) {");
      g.block(() => {
        g.line(
          'throw new VdlError({ message: validationError, code: "INVALID_INPUT", category: "ValidationError" });',
        );
      });
      g.line("}");
      g.line(
        "const rawResponse = await this.intClient.callProc(this.rpcName, this.procName, input, this.headerProviders, this.retryConfig, this.timeoutConfig, this.signal);",
      );
      g.line("if (!rawResponse.ok) {");
      g.block(() => {
        g.line("throw rawResponse.error;");
      });
      g.line("}");
      g.line(
        `return ${outputHelper}.hydrate(rawResponse.output as ${outputType});`,
      );
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}

/**
 * Emits one typed stream builder.
 */
function renderStreamBuilder(
  g: ReturnType<typeof newGenerator>,
  operation: OperationDescriptor,
): void {
  const inputType = renderRuntimeTypeReference(operation.inputTypeName);
  const outputType = renderRuntimeTypeReference(operation.outputTypeName);
  const inputHelper = renderRuntimeHelperReference(operation.inputTypeName);
  const outputHelper = renderRuntimeHelperReference(operation.outputTypeName);
  const responseType = operation.streamResponseTypeName;
  const executeSignature = operation.inputTypeName
    ? `execute(input: ${inputType})`
    : `execute(input: Void = {})`;

  g.line(`export type ${responseType} = Response<${outputType}>;`);
  g.break();

  g.line(`class Stream${operation.rpcName}${operation.name}Builder {`);
  g.block(() => {
    g.line("private readonly intClient: internalClient;");
    g.line("private readonly rpcName: string;");
    g.line("private readonly streamName: string;");
    g.line("private readonly headerProviders: HeaderProvider[] = [];");
    g.line("private reconnectConfig?: ReconnectConfig;");
    g.line("private maxMessageSize = 0;");
    g.line("private onConnectCb?: () => void;");
    g.line("private onDisconnectCb?: (error: Error | null) => void;");
    g.line(
      "private onReconnectCb?: (attempt: number, delayMs: number) => void;",
    );
    g.line("private signal?: AbortSignal;");
    g.break();

    g.line(
      "constructor(intClient: internalClient, rpcName: string, streamName: string) {",
    );
    g.block(() => {
      g.line("this.intClient = intClient;");
      g.line("this.rpcName = rpcName;");
      g.line("this.streamName = streamName;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Adds a static header to this stream subscription.",
    });
    g.line(
      `withHeader(key: string, value: string): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line(
        "this.headerProviders.push((headers) => { headers[key] = value; });",
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Adds a dynamic header provider to this stream subscription. The provider runs again for every reconnect attempt.",
    });
    g.line(
      `withHeaderProvider(provider: HeaderProvider): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.headerProviders.push(provider);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback:
        "Configures reconnect behavior for this stream. The optional shouldReconnect callback receives the resolved operation metadata, including annotations.",
    });
    g.line(
      `withReconnect(config: Partial<ReconnectConfig>): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.reconnectConfig = normalizeReconnectConfig(config, 5);");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withReconnectConfig(config: ReconnectConfig): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line(
        "this.reconnectConfig = normalizeReconnectConfig(config, config.maxAttempts);",
      );
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Sets the maximum allowed stream message size in bytes.",
    });
    g.line(
      `withMaxMessageSize(size: number): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.maxMessageSize = size;");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      fallback: "Registers a callback invoked after the stream connects.",
    });
    g.line(
      `onConnect(cb: () => void): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.onConnectCb = cb;");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withOnConnect(cb: () => void): Stream${operation.rpcName}${operation.name}Builder { return this.onConnect(cb); }`,
    );
    g.break();

    writeDocComment(g, {
      fallback:
        "Registers a callback invoked when the stream permanently disconnects.",
    });
    g.line(
      `onDisconnect(cb: (error: Error | null) => void): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.onDisconnectCb = cb;");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withOnDisconnect(cb: (error: Error | null) => void): Stream${operation.rpcName}${operation.name}Builder { return this.onDisconnect(cb); }`,
    );
    g.break();

    writeDocComment(g, {
      fallback: "Registers a callback invoked before each reconnect attempt.",
    });
    g.line(
      `onReconnect(cb: (attempt: number, delayMs: number) => void): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.onReconnectCb = cb;");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    g.line(
      `withOnReconnect(cb: (attempt: number, delayMs: number) => void): Stream${operation.rpcName}${operation.name}Builder { return this.onReconnect(cb); }`,
    );
    g.break();

    writeDocComment(g, {
      fallback: "Sets an external AbortSignal used to cancel this stream.",
    });
    g.line(
      `withSignal(signal: AbortSignal): Stream${operation.rpcName}${operation.name}Builder {`,
    );
    g.block(() => {
      g.line("this.signal = signal;");
      g.line("return this;");
    });
    g.line("}");
    g.break();

    writeDocComment(g, {
      doc: operation.doc,
      annotations: operation.annotations,
      fallback: `Opens ${operation.rpcName}.${operation.name}.`,
    });
    g.line(
      `${executeSignature}: { stream: AsyncGenerator<${responseType}, void, unknown>; cancel: () => void } {`,
    );
    g.block(() => {
      g.line(`const validationError = ${inputHelper}.validate(input);`);
      g.line("if (validationError !== null) {");
      g.block(() => {
        g.line(
          'throw new VdlError({ message: validationError, code: "INVALID_INPUT", category: "ValidationError" });',
        );
      });
      g.line("}");
      g.line(
        "const { stream, cancel } = this.intClient.callStream(this.rpcName, this.streamName, input, this.headerProviders, this.reconnectConfig, this.maxMessageSize, this.onConnectCb, this.onDisconnectCb, this.onReconnectCb, this.signal);",
      );
      g.line(
        `const typedStream = async function* (): AsyncGenerator<${responseType}, void, unknown> {`,
      );
      g.block(() => {
        g.line("for await (const event of stream) {");
        g.block(() => {
          g.line("if (!event.ok) {");
          g.block(() => {
            g.line(
              `yield { ok: false, error: event.error } as ${responseType};`,
            );
          });
          g.line("continue;");
          g.line("}");
          g.line(
            `yield { ok: true, output: ${outputHelper}.hydrate(event.output as ${outputType}) } as ${responseType};`,
          );
        });
        g.line("}");
      });
      g.line("};");
      g.line("return { stream: typedStream(), cancel }; ");
    });
    g.line("}");
  });
  g.line("}");
  g.break();
}
