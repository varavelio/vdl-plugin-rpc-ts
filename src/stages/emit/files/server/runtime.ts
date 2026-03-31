import { dedent } from "@varavel/vdl-plugin-sdk/utils/strings";

/**
 * Returns the raw shared server runtime source.
 */
export function renderServerRuntimeSource(): string {
  return SERVER_RUNTIME.trim();
}

const SERVER_RUNTIME = dedent(/* ts */ `
  /**
   * HTTPAdapter defines the interface required by VDL server to handle
   * incoming HTTP requests and write responses to clients.
   *
   * This abstraction allows the server to work with different HTTP frameworks
   * (Express, Fastify, standard http, etc.) while maintaining the same core functionality.
   */
  export interface HTTPAdapter {
    /**
     * Returns the parsed JSON body of the request.
     * The server expects the body to be a JSON object containing the RPC input.
     */
    json(): Promise<unknown>;

    /**
     * Sets a response header with the specified key-value pair.
     */
    setHeader(key: string, value: string): void;

    /**
     * Writes data to the response.
     * For procedures, this is called once with the full response.
     * For streams, this is called for each chunk.
     */
    write(data: string): void;

    /**
     * Flushes any buffered response data to the client.
     * Crucial for streaming responses to ensure real-time delivery.
     * Optional if the underlying framework handles this automatically.
     */
    flush?(): void;

    /**
     * Signals that the response is complete.
     */
    end(): void;

    /**
     * Registers a callback to be invoked when the connection is closed by the client.
     * Used to stop stream processing when the client disconnects.
     */
    onClose(callback: () => void): void;
  }

  /**
   * HandlerContext is the unified container for all request information and state
   * that flows through the entire request processing pipeline.
   *
   * @typeParam T - The application context type containing dependencies and request-scoped data.
   * @typeParam I - The input payload type for this operation.
   */
  export class HandlerContext<T, I> {
    /** User-defined container for application dependencies and request data. */
    public props: T;

    /** The request input, already deserialized and typed. */
    public input: I;

    /** Signal for cancellation (client disconnects). */
    public signal: AbortSignal;

    /** Details of the RPC operation. */
    public readonly operation: OperationDefinition;

    constructor(
      props: T,
      input: I,
      signal: AbortSignal,
      operation: OperationDefinition,
    ) {
      this.props = props;
      this.input = input;
      this.signal = signal;
      this.operation = operation;
    }

    get rpcName(): string {
      return this.operation.rpcName;
    }

    get operationName(): string {
      return this.operation.name;
    }

    get operationType(): OperationDefinition["type"] {
      return this.operation.type;
    }

    get annotations(): OperationAnnotation[] {
      return this.operation.annotations;
    }
  }

  // -----------------------------------------------------------------------------
  // Middleware Types
  // -----------------------------------------------------------------------------

  /** A handler used by global middleware. */
  export type GlobalHandlerFunc<T> = (c: HandlerContext<T, unknown>) => Promise<unknown>;

  /** Middleware applied to every procedure and stream. */
  export type GlobalMiddlewareFunc<T> = (next: GlobalHandlerFunc<T>) => GlobalHandlerFunc<T>;

  /** Typed procedure handler. */
  export type ProcHandlerFunc<T, I, O> = (c: HandlerContext<T, I>) => Promise<O>;

  /** Typed procedure middleware. */
  export type ProcMiddlewareFunc<T, I, O> = (next: ProcHandlerFunc<T, I, O>) => ProcHandlerFunc<T, I, O>;

  /** Function used to emit one stream event. */
  export type EmitFunc<T, I, O> = (c: HandlerContext<T, I>, output: O) => Promise<void>;

  /** Typed stream handler. */
  export type StreamHandlerFunc<T, I, O> = (c: HandlerContext<T, I>, emit: EmitFunc<T, I, O>) => Promise<void>;

  /** Typed stream middleware. */
  export type StreamMiddlewareFunc<T, I, O> = (next: StreamHandlerFunc<T, I, O>) => StreamHandlerFunc<T, I, O>;

  /** Typed emit middleware. */
  export type EmitMiddlewareFunc<T, I, O> = (next: EmitFunc<T, I, O>) => EmitFunc<T, I, O>;

  /** Input deserializer used internally by the generated server. */
  export type DeserializerFunc = (raw: unknown) => Promise<unknown>;

  /** Error handler that maps arbitrary failures into VdlError values. */
  export type ErrorHandlerFunc<T> = (c: HandlerContext<T, unknown>, error: unknown) => VdlError;

  /** Stream-level configuration. */
  export interface StreamConfig {
    /** Interval in milliseconds between SSE ping comments. */
    pingIntervalMs?: number;
  }

  // -----------------------------------------------------------------------------
  // Server Internal Implementation
  // -----------------------------------------------------------------------------

  /**
   * InternalServer contains the transport-agnostic request processing engine used by the generated facade.
   */
  export class InternalServer<T> {
    private readonly operationDefs: Map<string, Map<string, OperationDefinition>>;
    private readonly procHandlers: Map<string, Map<string, ProcHandlerFunc<T, any, any>>>;
    private readonly streamHandlers: Map<string, Map<string, StreamHandlerFunc<T, any, any>>>;
    private readonly globalMiddlewares: GlobalMiddlewareFunc<T>[];
    private readonly rpcMiddlewares: Map<string, GlobalMiddlewareFunc<T>[]>;
    private readonly procMiddlewares: Map<string, Map<string, ProcMiddlewareFunc<T, any, any>[]>>;
    private readonly streamMiddlewares: Map<string, Map<string, StreamMiddlewareFunc<T, any, any>[]>>;
    private readonly streamEmitMiddlewares: Map<string, Map<string, EmitMiddlewareFunc<T, any, any>[]>>;
    private readonly procDeserializers: Map<string, Map<string, DeserializerFunc>>;
    private readonly streamDeserializers: Map<string, Map<string, DeserializerFunc>>;
    private globalStreamConfig: StreamConfig;
    private readonly rpcStreamConfigs: Map<string, StreamConfig>;
    private readonly streamConfigs: Map<string, Map<string, StreamConfig>>;
    private globalErrorHandler?: ErrorHandlerFunc<T>;
    private readonly rpcErrorHandlers: Map<string, ErrorHandlerFunc<T>>;

    constructor(procDefs: OperationDefinition[], streamDefs: OperationDefinition[]) {
      this.operationDefs = new Map();
      this.procHandlers = new Map();
      this.streamHandlers = new Map();
      this.globalMiddlewares = [];
      this.rpcMiddlewares = new Map();
      this.procMiddlewares = new Map();
      this.streamMiddlewares = new Map();
      this.streamEmitMiddlewares = new Map();
      this.procDeserializers = new Map();
      this.streamDeserializers = new Map();
      this.globalStreamConfig = { pingIntervalMs: 30000 };
      this.rpcStreamConfigs = new Map();
      this.streamConfigs = new Map();
      this.rpcErrorHandlers = new Map();

      const ensureRPC = (rpcName: string) => {
        if (!this.operationDefs.has(rpcName)) {
          this.operationDefs.set(rpcName, new Map());
          this.procHandlers.set(rpcName, new Map());
          this.streamHandlers.set(rpcName, new Map());
          this.rpcMiddlewares.set(rpcName, []);
          this.procMiddlewares.set(rpcName, new Map());
          this.streamMiddlewares.set(rpcName, new Map());
          this.streamEmitMiddlewares.set(rpcName, new Map());
          this.procDeserializers.set(rpcName, new Map());
          this.streamDeserializers.set(rpcName, new Map());
          this.rpcStreamConfigs.set(rpcName, {});
          this.streamConfigs.set(rpcName, new Map());
        }
      };

      for (const def of procDefs) {
        ensureRPC(def.rpcName);
        this.operationDefs.get(def.rpcName)?.set(def.name, def);
      }

      for (const def of streamDefs) {
        ensureRPC(def.rpcName);
        this.operationDefs.get(def.rpcName)?.set(def.name, def);
      }
    }

    /** Registers a global middleware. */
    addGlobalMiddleware(mw: GlobalMiddlewareFunc<T>): void {
      this.globalMiddlewares.push(mw);
    }

    /** Registers an RPC-level middleware. */
    addRPCMiddleware(rpcName: string, mw: GlobalMiddlewareFunc<T>): void {
      this.rpcMiddlewares.get(rpcName)?.push(mw);
    }

    /** Registers a procedure-specific middleware. */
    addProcMiddleware(rpcName: string, procName: string, mw: ProcMiddlewareFunc<T, any, any>): void {
      const rpcMap = this.procMiddlewares.get(rpcName);
      if (!rpcMap) {
        return;
      }

      if (!rpcMap.has(procName)) {
        rpcMap.set(procName, []);
      }

      rpcMap.get(procName)?.push(mw);
    }

    /** Registers a stream-specific middleware. */
    addStreamMiddleware(rpcName: string, streamName: string, mw: StreamMiddlewareFunc<T, any, any>): void {
      const rpcMap = this.streamMiddlewares.get(rpcName);
      if (!rpcMap) {
        return;
      }

      if (!rpcMap.has(streamName)) {
        rpcMap.set(streamName, []);
      }

      rpcMap.get(streamName)?.push(mw);
    }

    /** Registers a stream emit middleware. */
    addStreamEmitMiddleware(rpcName: string, streamName: string, mw: EmitMiddlewareFunc<T, any, any>): void {
      const rpcMap = this.streamEmitMiddlewares.get(rpcName);
      if (!rpcMap) {
        return;
      }

      if (!rpcMap.has(streamName)) {
        rpcMap.set(streamName, []);
      }

      rpcMap.get(streamName)?.push(mw);
    }

    /** Sets the global stream configuration. */
    setGlobalStreamConfig(cfg: StreamConfig): void {
      this.globalStreamConfig = { ...this.globalStreamConfig, ...cfg };
      if (!this.globalStreamConfig.pingIntervalMs || this.globalStreamConfig.pingIntervalMs <= 0) {
        this.globalStreamConfig.pingIntervalMs = 30000;
      }
    }

    /** Sets the default stream configuration for one RPC service. */
    setRPCStreamConfig(rpcName: string, cfg: StreamConfig): void {
      this.rpcStreamConfigs.set(rpcName, cfg);
    }

    /** Sets the configuration for one stream. */
    setStreamConfig(rpcName: string, streamName: string, cfg: StreamConfig): void {
      const rpcConfigs = this.streamConfigs.get(rpcName);
      rpcConfigs?.set(streamName, cfg);
    }

    /** Sets the global error handler. */
    setGlobalErrorHandler(handler: ErrorHandlerFunc<T>): void {
      this.globalErrorHandler = handler;
    }

    /** Sets an RPC-specific error handler. */
    setRPCErrorHandler(rpcName: string, handler: ErrorHandlerFunc<T>): void {
      this.rpcErrorHandlers.set(rpcName, handler);
    }

    /** Registers the implementation and deserializer for one procedure. */
    setProcHandler(rpcName: string, procName: string, handler: ProcHandlerFunc<T, any, any>, deserializer: DeserializerFunc): void {
      const rpcHandlers = this.procHandlers.get(rpcName);
      if (rpcHandlers) {
        if (rpcHandlers.has(procName)) {
          throw new Error("Procedure handler for " + rpcName + "." + procName + " is already registered");
        }
        rpcHandlers.set(procName, handler);
      }

      this.procDeserializers.get(rpcName)?.set(procName, deserializer);
    }

    /** Registers the implementation and deserializer for one stream. */
    setStreamHandler(rpcName: string, streamName: string, handler: StreamHandlerFunc<T, any, any>, deserializer: DeserializerFunc): void {
      const rpcHandlers = this.streamHandlers.get(rpcName);
      if (rpcHandlers) {
        if (rpcHandlers.has(streamName)) {
          throw new Error("Stream handler for " + rpcName + "." + streamName + " is already registered");
        }
        rpcHandlers.set(streamName, handler);
      }

      this.streamDeserializers.get(rpcName)?.set(streamName, deserializer);
    }

    /** Handles one incoming RPC request. */
    async handleRequest(props: T, rpcName: string, operationName: string, adapter: HTTPAdapter): Promise<void> {
      if (!adapter) {
        throw new Error("HTTPAdapter is required");
      }

      let rawInput: unknown;
      try {
        rawInput = await adapter.json();
      } catch (error) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: new VdlError({
            message: "Invalid request body",
            details: { originalError: String(error) },
          }),
        });
        return;
      }

      const operation = this.operationDefs.get(rpcName)?.get(operationName);
      if (!operation) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: new VdlError({
            message: "Invalid operation: " + rpcName + "." + operationName,
            code: "INVALID_OPERATION",
            category: "ClientError",
          }),
        });
        return;
      }

      const abortController = new AbortController();
      adapter.onClose(() => abortController.abort());

      const ctx = new HandlerContext<T, unknown>(
        props,
        rawInput,
        abortController.signal,
        operation,
      );

      if (operation.type === "stream") {
        await this.handleStreamRequest(ctx, rpcName, operationName, adapter);
        return;
      }

      let response: Response<unknown>;
      try {
        const output = await this.handleProcRequest(ctx, rpcName, operationName);
        response = { ok: true, output };
      } catch (error) {
        response = {
          ok: false,
          error: this.resolveErrorHandler(rpcName)(ctx, error),
        };
      }

      this.writeProcResponse(adapter, response);
    }

    /** Resolves the effective error handler for one RPC service. */
    private resolveErrorHandler(rpcName: string): ErrorHandlerFunc<T> {
      const rpcHandler = this.rpcErrorHandlers.get(rpcName);
      if (rpcHandler) {
        return rpcHandler;
      }

      if (this.globalErrorHandler) {
        return this.globalErrorHandler;
      }

      return (_ctx, error) => asError(error);
    }

    /** Executes one procedure including all middleware layers. */
    private async handleProcRequest(c: HandlerContext<T, unknown>, rpcName: string, procName: string): Promise<unknown> {
      const baseHandler = this.procHandlers.get(rpcName)?.get(procName);
      const deserialize = this.procDeserializers.get(rpcName)?.get(procName);
      if (!baseHandler || !deserialize) {
        throw new Error(rpcName + "." + procName + " procedure not implemented");
      }

      c.input = await deserialize(c.input);

      let next: GlobalHandlerFunc<T> = (ctx) => baseHandler(ctx as HandlerContext<T, any>);

      const procMws = this.procMiddlewares.get(rpcName)?.get(procName) ?? [];
      if (procMws.length > 0) {
        let procNext = baseHandler;
        for (let index = procMws.length - 1; index >= 0; index -= 1) {
          procNext = procMws[index](procNext);
        }
        next = (ctx) => procNext(ctx as HandlerContext<T, any>);
      }

      const rpcMws = this.rpcMiddlewares.get(rpcName) ?? [];
      for (let index = rpcMws.length - 1; index >= 0; index -= 1) {
        next = rpcMws[index](next);
      }

      for (let index = this.globalMiddlewares.length - 1; index >= 0; index -= 1) {
        next = this.globalMiddlewares[index](next);
      }

      return next(c);
    }

    /** Executes one stream including middleware, emission, and SSE lifecycle handling. */
    private async handleStreamRequest(c: HandlerContext<T, unknown>, rpcName: string, streamName: string, adapter: HTTPAdapter): Promise<void> {
      const baseHandler = this.streamHandlers.get(rpcName)?.get(streamName);
      const deserialize = this.streamDeserializers.get(rpcName)?.get(streamName);
      if (!baseHandler || !deserialize) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: new VdlError({
            message: rpcName + "." + streamName + " not implemented",
            code: "NOT_IMPLEMENTED",
          }),
        });
        return;
      }

      try {
        c.input = await deserialize(c.input);
      } catch (error) {
        this.writeProcResponse(adapter, {
          ok: false,
          error: asError(error),
        });
        return;
      }

      adapter.setHeader("Content-Type", "text/event-stream");
      adapter.setHeader("Cache-Control", "no-cache");
      adapter.setHeader("Connection", "keep-alive");

      let closed = false;
      adapter.onClose(() => {
        closed = true;
      });

      const safeWrite = (data: string) => {
        if (closed || c.signal.aborted) {
          return;
        }
        adapter.write(data);
        adapter.flush?.();
      };

      let pingInterval = this.globalStreamConfig.pingIntervalMs || 30000;
      const rpcConfig = this.rpcStreamConfigs.get(rpcName);
      if (rpcConfig?.pingIntervalMs) {
        pingInterval = rpcConfig.pingIntervalMs;
      }
      const streamConfig = this.streamConfigs.get(rpcName)?.get(streamName);
      if (streamConfig?.pingIntervalMs) {
        pingInterval = streamConfig.pingIntervalMs;
      }
      if (pingInterval <= 0) {
        pingInterval = 30000;
      }

      const pingTimer = setInterval(() => {
        if (closed || c.signal.aborted) {
          clearInterval(pingTimer);
          return;
        }

        safeWrite(": ping\\n\\n");
      }, pingInterval);

      const cleanup = () => {
        clearInterval(pingTimer);
        closed = true;
        adapter.end();
      };

      const baseEmit: EmitFunc<T, any, unknown> = async (_ctx, output) => {
        safeWrite("data: " + JSON.stringify({ ok: true, output }) + "\\n\\n");
      };

      let emitFinal = baseEmit;
      const emitMws = this.streamEmitMiddlewares.get(rpcName)?.get(streamName) ?? [];
      for (let index = emitMws.length - 1; index >= 0; index -= 1) {
        emitFinal = emitMws[index](emitFinal);
      }

      let next: GlobalHandlerFunc<T> = (ctx) =>
        baseHandler(ctx as HandlerContext<T, any>, emitFinal) as Promise<unknown>;

      const streamMws = this.streamMiddlewares.get(rpcName)?.get(streamName) ?? [];
      if (streamMws.length > 0) {
        let streamNext = baseHandler;
        for (let index = streamMws.length - 1; index >= 0; index -= 1) {
          streamNext = streamMws[index](streamNext);
        }
        next = (ctx) => streamNext(ctx as HandlerContext<T, any>, emitFinal) as Promise<unknown>;
      }

      const rpcMws = this.rpcMiddlewares.get(rpcName) ?? [];
      for (let index = rpcMws.length - 1; index >= 0; index -= 1) {
        next = rpcMws[index](next);
      }

      for (let index = this.globalMiddlewares.length - 1; index >= 0; index -= 1) {
        next = this.globalMiddlewares[index](next);
      }

      try {
        await next(c);
      } catch (error) {
        const mapped = this.resolveErrorHandler(rpcName)(c, error);
        safeWrite("data: " + JSON.stringify({ ok: false, error: mapped }) + "\\n\\n");
      } finally {
        cleanup();
      }
    }

    /** Writes one standard JSON procedure response. */
    private writeProcResponse(adapter: HTTPAdapter, response: Response<unknown>): void {
      adapter.setHeader("Content-Type", "application/json");
      adapter.write(JSON.stringify(response));
      adapter.end();
    }
  }
`);
