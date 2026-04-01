import { dedent } from "@varavel/vdl-plugin-sdk/utils/strings";

/**
 * Returns the raw shared client runtime source.
 */
export function renderClientRuntimeSource(): string {
  return CLIENT_RUNTIME.trim();
}

const CLIENT_RUNTIME = dedent(/* ts */ `
  /**
   * Context provided to a retry decider.
   */
  export interface RetryDecisionContext {
    /** Current attempt number, starting at 1. */
    attempt: number;
    /** Maximum configured attempts. */
    maxAttempts: number;
    /** Error produced by the current attempt. */
    error: VdlError;
    /** Original input payload. */
    input: unknown;
    /** Resolved operation metadata, including annotations. */
    operation?: OperationDefinition;
    /** Whether the generated runtime would retry without custom logic. */
    defaultRetryable: boolean;
  }

  /**
   * Context provided to a reconnect decider.
   */
  export interface ReconnectDecisionContext {
    /** Current reconnect attempt number, starting at 1. */
    attempt: number;
    /** Maximum configured reconnect attempts. */
    maxAttempts: number;
    /** Error that triggered the reconnect evaluation. */
    error: VdlError;
    /** Original subscription input payload. */
    input: unknown;
    /** Resolved operation metadata, including annotations. */
    operation?: OperationDefinition;
    /** Calculated delay before the next reconnect attempt. */
    delayMs: number;
    /** Whether the generated runtime would reconnect without custom logic. */
    defaultReconnectable: boolean;
  }

  /**
   * Controls automatic retry behavior for procedure calls.
   *
   * When a request fails due to network errors, timeouts, or 5xx HTTP status codes,
   * the client can automatically retry using exponential backoff.
   */
  export interface RetryConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    delayMultiplier: number;
    jitter: number;
    shouldRetry?: (context: RetryDecisionContext) => boolean | Promise<boolean>;
  }

  /**
   * Controls request timeout behavior.
   *
   * If the server does not respond within the configured timeout, the request is aborted
   * and may be retried according to the effective retry configuration.
   */
  export interface TimeoutConfig {
    timeoutMs: number;
  }

  /**
   * Controls automatic reconnection behavior for streams.
   *
   * When a stream connection is lost due to network issues or server errors,
   * the client can automatically attempt to reconnect with exponential backoff.
   */
  export interface ReconnectConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    delayMultiplier: number;
    jitter: number;
    shouldReconnect?: (
      context: ReconnectDecisionContext,
    ) => boolean | Promise<boolean>;
  }

  /**
   * A function that adds or modifies headers before each request.
   *
   * Header providers are executed in this order: global, RPC-level, operation-level.
   * They run before every request attempt, including retries and reconnects.
   */
  export type HeaderProvider = (
    headers: Record<string, string>,
  ) => void | Promise<void>;

  /**
   * Metadata about the current RPC request, passed to interceptors.
   */
  export interface RequestInfo {
    rpcName: string;
    operationName: string;
    input: unknown;
    type: OperationType;
    operation?: OperationDefinition;
  }

  /** Final function invoked by the interceptor chain. */
  export type Invoker = (req: RequestInfo) => Promise<Response<unknown>>;

  /** Request interceptor used by generated clients. */
  export type Interceptor = (
    req: RequestInfo,
    next: Invoker,
  ) => Promise<Response<unknown>>;

  /**
   * Minimal interface for a fetch response.
   * Compatible with the standard Fetch API and most polyfills.
   */
  export interface FetchLikeResponse {
    ok: boolean;
    status: number;
    body?: ReadableStream<Uint8Array> | null;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  /**
   * Minimal interface for a fetch function.
   * Compatible with the standard Fetch API, node-fetch, and most polyfills.
   */
  export type FetchLike = (input: any, init?: any) => Promise<FetchLikeResponse>;

  /**
   * Default retry config: no retries (single attempt).
   */
  const defaultRetryConfig: RetryConfig = {
    maxAttempts: 1,
    initialDelayMs: 0,
    maxDelayMs: 0,
    delayMultiplier: 1,
    jitter: 0.2,
  };

  /**
   * Default timeout: 30 seconds.
   */
  const defaultTimeoutConfig: TimeoutConfig = {
    timeoutMs: 30000,
  };

  /**
   * Default reconnect config for streams.
   */
  const defaultReconnectConfig: ReconnectConfig = {
    maxAttempts: 30,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    delayMultiplier: 1.5,
    jitter: 0.2,
  };

  /** Default maximum message size for streams: 4MB. */
  const defaultMaxMessageSize = 4 * 1024 * 1024;

  /**
   * Adds random jitter to a delay to prevent thundering herd effects.
   */
  function applyJitter(delayMs: number, jitterFactor: number): number {
    if (jitterFactor <= 0) {
      return delayMs;
    }

    const boundedJitter = Math.min(jitterFactor, 1);
    const delta = delayMs * boundedJitter;
    const min = Math.max(0, delayMs - delta);
    const max = delayMs + delta;
    return min + Math.random() * (max - min);
  }

  /**
   * Calculates exponential backoff delay for retry attempts.
   */
  function calculateBackoff(config: RetryConfig, attempt: number): number {
    let delay = config.initialDelayMs;
    for (let index = 1; index < attempt; index += 1) {
      delay *= config.delayMultiplier;
    }
    if (delay > config.maxDelayMs) {
      delay = config.maxDelayMs;
    }
    return applyJitter(delay, config.jitter);
  }

  /**
   * Calculates exponential backoff delay for stream reconnection attempts.
   */
  function calculateReconnectBackoff(
    config: ReconnectConfig,
    attempt: number,
  ): number {
    let delay = config.initialDelayMs;
    for (let index = 1; index < attempt; index += 1) {
      delay *= config.delayMultiplier;
    }
    if (delay > config.maxDelayMs) {
      delay = config.maxDelayMs;
    }
    return applyJitter(delay, config.jitter);
  }

  function normalizeRetryConfig(
    config: Partial<RetryConfig>,
    defaultAttempts = 1,
  ): RetryConfig {
    return {
      maxAttempts: Math.max(1, config.maxAttempts ?? defaultAttempts),
      initialDelayMs: Math.max(0, config.initialDelayMs ?? 0),
      maxDelayMs: Math.max(0, config.maxDelayMs ?? 0),
      delayMultiplier: Math.max(1, config.delayMultiplier ?? 1),
      jitter: Math.max(0, Math.min(1, config.jitter ?? 0.2)),
      ...(config.shouldRetry ? { shouldRetry: config.shouldRetry } : {}),
    };
  }

  function normalizeTimeoutConfig(config: Partial<TimeoutConfig>): TimeoutConfig {
    return {
      timeoutMs: Math.max(0, config.timeoutMs ?? defaultTimeoutConfig.timeoutMs),
    };
  }

  function normalizeReconnectConfig(
    config: Partial<ReconnectConfig>,
    defaultAttempts = 30,
  ): ReconnectConfig {
    return {
      maxAttempts: Math.max(0, config.maxAttempts ?? defaultAttempts),
      initialDelayMs: Math.max(
        0,
        config.initialDelayMs ?? defaultReconnectConfig.initialDelayMs,
      ),
      maxDelayMs: Math.max(
        0,
        config.maxDelayMs ?? defaultReconnectConfig.maxDelayMs,
      ),
      delayMultiplier: Math.max(
        1,
        config.delayMultiplier ?? defaultReconnectConfig.delayMultiplier,
      ),
      jitter: Math.max(
        0,
        Math.min(1, config.jitter ?? defaultReconnectConfig.jitter),
      ),
      ...(config.shouldReconnect
        ? { shouldReconnect: config.shouldReconnect }
        : {}),
    };
  }

  // =============================================================================
  // Internal Client
  // =============================================================================

  /**
   * Core HTTP client engine used by generated VDL client wrappers.
   *
   * This class handles request execution, retry logic, timeout handling,
   * stream connections, header providers, and interceptors.
   *
   * Do not instantiate directly. Use the generated client builder.
   *
   * @internal
   */
  class internalClient {
    /** Base URL for all requests (trailing slashes are stripped). */
    private baseURL: string;

    /** The fetch implementation used for HTTP requests. */
    private fetchFn: FetchLike;

    /**
     * Registry of valid operations.
     * Structure: rpcName → operationName → OperationType
     * Used to validate requests and fail fast on typos.
     */
    private operationDefs: Map<string, Map<string, OperationDefinition>>;

    // ---------------------------------------------------------------------------
    // Dynamic Components
    // ---------------------------------------------------------------------------

    /** Global header providers applied to all requests. */
    private headerProviders: HeaderProvider[] = [];

    /** Interceptors applied to all requests (in registration order). */
    private interceptors: Interceptor[] = [];

    /** RPC-specific header providers. Key: rpcName. */
    private rpcHeaderProviders: Map<string, HeaderProvider[]> = new Map();

    // ---------------------------------------------------------------------------
    // Global Default Configurations
    // ---------------------------------------------------------------------------

    private globalRetryConf: RetryConfig | null = null;
    private globalTimeoutConf: TimeoutConfig | null = null;
    private globalReconnectConf: ReconnectConfig | null = null;
    private globalMaxMessageSize: number = 0;

    // ---------------------------------------------------------------------------
    // Per-RPC Default Configurations
    // ---------------------------------------------------------------------------

    private rpcRetryConf: Map<string, RetryConfig> = new Map();
    private rpcTimeoutConf: Map<string, TimeoutConfig> = new Map();
    private rpcReconnectConf: Map<string, ReconnectConfig> = new Map();
    private rpcMaxMessageSize: Map<string, number> = new Map();

    // ---------------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------------

    /**
     * Creates a new internal client.
     *
     * @throws If required runtime dependencies are missing.
     * @throws If no fetch implementation is available.
     */
    constructor(
      baseURL: string,
      procDefs: OperationDefinition[],
      streamDefs: OperationDefinition[],
      opts: internalClientOption[],
    ) {
      this.verifyRuntimeDeps();

      this.baseURL = baseURL.replace(/[/]+$/gu, "");
      this.fetchFn = (globalThis.fetch ?? null) as FetchLike;
      this.operationDefs = new Map();

      const ensureRPC = (rpcName: string) => {
        if (!this.operationDefs.has(rpcName)) {
          this.operationDefs.set(rpcName, new Map());
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

      for (const applyOption of opts) {
        applyOption(this);
      }

      if (!this.fetchFn) {
        throw new Error(
          "globalThis.fetch is undefined. Provide a custom fetch with withCustomFetch().",
        );
      }
    }

    /**
     * Verifies that required runtime APIs are available.
     */
    private verifyRuntimeDeps() {
      const missing: string[] = [];

      if (typeof AbortController !== "function") {
        missing.push("AbortController");
      }
      if (typeof ReadableStream === "undefined") {
        missing.push("ReadableStream");
      }
      if (typeof TextDecoder !== "function") {
        missing.push("TextDecoder");
      }

      if (missing.length > 0) {
        throw new Error(
          "Missing required runtime dependencies: " +
            missing.join(", ") +
            ". Install the necessary polyfills or use a compatible environment.",
        );
      }
    }

    // ---------------------------------------------------------------------------
    // Configuration Setters (called by builder options)
    // ---------------------------------------------------------------------------

    /** Sets a custom fetch implementation. */
    setFetch(fetchFn: FetchLike): void {
      this.fetchFn = fetchFn;
    }

    /** Adds a global header provider. */
    addHeaderProvider(provider: HeaderProvider): void {
      this.headerProviders.push(provider);
    }

    /** Adds an interceptor to the chain. */
    addInterceptor(interceptor: Interceptor): void {
      this.interceptors.push(interceptor);
    }

    /** Sets the global default retry configuration. */
    setGlobalRetryConfig(conf: RetryConfig): void {
      this.globalRetryConf = normalizeRetryConfig(conf, conf.maxAttempts);
    }

    /** Sets the global default timeout configuration. */
    setGlobalTimeoutConfig(conf: TimeoutConfig): void {
      this.globalTimeoutConf = normalizeTimeoutConfig(conf);
    }

    /** Sets the global default reconnect configuration for streams. */
    setGlobalReconnectConfig(conf: ReconnectConfig): void {
      this.globalReconnectConf = normalizeReconnectConfig(conf, conf.maxAttempts);
    }

    /** Sets the global default maximum message size for streams. */
    setGlobalMaxMessageSize(size: number): void {
      this.globalMaxMessageSize = size;
    }

    // ---------------------------------------------------------------------------
    // Per-RPC Configuration Setters
    // ---------------------------------------------------------------------------

    /** Sets the default retry config for a specific RPC. */
    setRPCRetryConfig(rpcName: string, conf: RetryConfig) {
      this.rpcRetryConf.set(rpcName, conf);
    }

    /** Sets the default timeout config for a specific RPC. */
    setRPCTimeoutConfig(rpcName: string, conf: TimeoutConfig) {
      this.rpcTimeoutConf.set(rpcName, conf);
    }

    /** Sets the default reconnect config for a specific RPC. */
    setRPCReconnectConfig(rpcName: string, conf: ReconnectConfig) {
      this.rpcReconnectConf.set(rpcName, conf);
    }

    /** Sets the default max message size for a specific RPC. */
    setRPCMaxMessageSize(rpcName: string, size: number) {
      this.rpcMaxMessageSize.set(rpcName, size);
    }

    /** Adds a header provider for a specific RPC. */
    setRPCHeaderProvider(rpcName: string, provider: HeaderProvider) {
      if (!this.rpcHeaderProviders.has(rpcName)) {
        this.rpcHeaderProviders.set(rpcName, []);
      }
      this.rpcHeaderProviders.get(rpcName)?.push(provider);
    }

    private getOperation(
      rpcName: string,
      operationName: string,
      expectedType: OperationType,
    ): OperationDefinition | undefined {
      const operation = this.operationDefs.get(rpcName)?.get(operationName);
      if (!operation || operation.type !== expectedType) {
        return undefined;
      }
      return operation;
    }

    /**
     * Resolves the effective retry configuration for a request.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeRetryConfig(
      rpcName: string,
      opConf?: RetryConfig,
    ): RetryConfig {
      return {
        ...defaultRetryConfig,
        ...(this.globalRetryConf ?? {}),
        ...(this.rpcRetryConf.get(rpcName) ?? {}),
        ...(opConf ?? {}),
        ...(opConf?.shouldRetry
          ? { shouldRetry: opConf.shouldRetry }
          : this.rpcRetryConf.get(rpcName)?.shouldRetry
            ? { shouldRetry: this.rpcRetryConf.get(rpcName)?.shouldRetry }
          : this.globalRetryConf?.shouldRetry
            ? { shouldRetry: this.globalRetryConf.shouldRetry }
            : {}),
      };
    }

    /**
     * Resolves the effective timeout configuration for a request.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeTimeoutConfig(
      rpcName: string,
      opConf?: TimeoutConfig,
    ): TimeoutConfig {
      return {
        ...defaultTimeoutConfig,
        ...(this.globalTimeoutConf ?? {}),
        ...(this.rpcTimeoutConf.get(rpcName) ?? {}),
        ...(opConf ?? {}),
      };
    }

    /**
     * Resolves the effective reconnect configuration for a stream.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeReconnectConfig(
      rpcName: string,
      opConf?: ReconnectConfig,
    ): ReconnectConfig {
      return {
        ...defaultReconnectConfig,
        ...(this.globalReconnectConf ?? {}),
        ...(this.rpcReconnectConf.get(rpcName) ?? {}),
        ...(opConf ?? {}),
        ...(opConf?.shouldReconnect
          ? { shouldReconnect: opConf.shouldReconnect }
          : this.rpcReconnectConf.get(rpcName)?.shouldReconnect
            ? {
                shouldReconnect:
                  this.rpcReconnectConf.get(rpcName)?.shouldReconnect,
              }
          : this.globalReconnectConf?.shouldReconnect
            ? { shouldReconnect: this.globalReconnectConf.shouldReconnect }
            : {}),
      };
    }

    /**
     * Resolves the effective maximum message size for a stream.
     * Priority: operation-level > RPC-level > global > built-in defaults.
     */
    private mergeMaxMessageSize(rpcName: string, opSize?: number): number {
      if (opSize && opSize > 0) {
        return opSize;
      }

      if (this.rpcMaxMessageSize.has(rpcName)) {
        const rpcSize = this.rpcMaxMessageSize.get(rpcName);
        if (rpcSize && rpcSize > 0) {
          return rpcSize;
        }
      }

      if (this.globalMaxMessageSize > 0) {
        return this.globalMaxMessageSize;
      }

      return defaultMaxMessageSize;
    }

    /**
     * Applies all header providers to a request's headers.
     * Order: global providers -> RPC providers -> operation providers.
     */
    private async applyHeaders(
      rpcName: string,
      headers: Record<string, string>,
      opHeaderProviders: HeaderProvider[],
    ): Promise<void> {
      for (const provider of this.headerProviders) {
        await provider(headers);
      }

      const rpcProviders = this.rpcHeaderProviders.get(rpcName) ?? [];
      for (const provider of rpcProviders) {
        await provider(headers);
      }

      for (const provider of opHeaderProviders) {
        await provider(headers);
      }
    }

    private async executeChain(
      reqInfo: RequestInfo,
      invoker: Invoker,
    ): Promise<Response<unknown>> {
      let next = invoker;
      for (let index = this.interceptors.length - 1; index >= 0; index -= 1) {
        const current = this.interceptors[index];
        const previousNext = next;
        next = (req) => current(req, previousNext);
      }
      return next(reqInfo);
    }

    private async shouldRetry(
      config: RetryConfig,
      context: RetryDecisionContext,
    ): Promise<boolean> {
      if (!config.shouldRetry) {
        return context.defaultRetryable;
      }

      return await config.shouldRetry(context);
    }

    private async shouldReconnect(
      config: ReconnectConfig,
      context: ReconnectDecisionContext,
    ): Promise<boolean> {
      if (!config.shouldReconnect) {
        return context.defaultReconnectable;
      }

      return await config.shouldReconnect(context);
    }

    async callProc(
      rpcName: string,
      procName: string,
      input: unknown,
      opHeaderProviders: HeaderProvider[],
      opRetryConf?: RetryConfig,
      opTimeoutConf?: TimeoutConfig,
      opSignal?: AbortSignal,
    ): Promise<Response<any>> {
      if (opSignal?.aborted) {
        return {
          ok: false,
          error: new VdlError({
            message: "Request aborted",
            category: "ClientError",
            code: "ABORTED",
          }),
        };
      }

      const operation = this.getOperation(rpcName, procName, "proc");
      const reqInfo: RequestInfo = {
        rpcName,
        operationName: procName,
        input,
        type: "proc",
        operation,
      };

      const invoker: Invoker = async (req) => {
        if (!operation) {
          return {
            ok: false,
            error: new VdlError({
              message:
                req.rpcName +
                "." +
                req.operationName +
                " procedure not found in schema",
              category: "ClientError",
              code: "INVALID_PROC",
              details: { rpc: req.rpcName, procedure: req.operationName },
            }),
          };
        }

        let payload: string;
        try {
          payload = req.input == null ? "{}" : JSON.stringify(req.input);
        } catch (error) {
          return {
            ok: false,
            error: new VdlError({
              message:
                "Failed to encode input for " +
                req.rpcName +
                "." +
                req.operationName +
                ": " +
                String(error),
              category: "ClientError",
              code: "ENCODE_INPUT",
            }),
          };
        }

        const retryConf = this.mergeRetryConfig(req.rpcName, opRetryConf);
        const timeoutConf = this.mergeTimeoutConfig(req.rpcName, opTimeoutConf);
        const url = this.baseURL + "/" + req.rpcName + "/" + req.operationName;
        let lastError: VdlError | null = null;

        for (let attempt = 1; attempt <= retryConf.maxAttempts; attempt += 1) {
          if (opSignal?.aborted) {
            return {
              ok: false,
              error: new VdlError({
                message: "Request aborted",
                category: "ClientError",
                code: "ABORTED",
              }),
            };
          }

          const abortController = new AbortController();
          let timeoutId: ReturnType<typeof setTimeout> | undefined;
          const onExternalAbort = () => abortController.abort();
          opSignal?.addEventListener("abort", onExternalAbort);

          try {
            if (timeoutConf.timeoutMs > 0) {
              timeoutId = setTimeout(
                () => abortController.abort(),
                timeoutConf.timeoutMs,
              );
            }

            const headers: Record<string, string> = {
              "content-type": "application/json",
              accept: "application/json",
            };

            try {
              await this.applyHeaders(req.rpcName, headers, opHeaderProviders);
            } catch (error) {
              if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
              }
              opSignal?.removeEventListener("abort", onExternalAbort);
              return { ok: false, error: asError(error) };
            }

            const fetchResponse = await this.fetchFn(url, {
              method: "POST",
              headers,
              body: payload,
              signal: abortController.signal,
            });

            if (timeoutId !== undefined) {
              clearTimeout(timeoutId);
            }
            opSignal?.removeEventListener("abort", onExternalAbort);

            if (fetchResponse.status >= 500) {
              const error = new VdlError({
                message:
                  "Unexpected HTTP status: " + String(fetchResponse.status),
                category: "HTTPError",
                code: "BAD_STATUS",
                details: { status: fetchResponse.status },
              });
              const canRetry =
                attempt < retryConf.maxAttempts &&
                (await this.shouldRetry(retryConf, {
                  attempt,
                  maxAttempts: retryConf.maxAttempts,
                  error,
                  input,
                  operation,
                  defaultRetryable: true,
                }));

              if (canRetry) {
                lastError = error;
                await sleep(calculateBackoff(retryConf, attempt));
                continue;
              }

              return { ok: false, error };
            }

            if (!fetchResponse.ok) {
              const error = new VdlError({
                message:
                  "Unexpected HTTP status: " + String(fetchResponse.status),
                category: "HTTPError",
                code: "BAD_STATUS",
                details: { status: fetchResponse.status },
              });
              const canRetry =
                attempt < retryConf.maxAttempts &&
                (await this.shouldRetry(retryConf, {
                  attempt,
                  maxAttempts: retryConf.maxAttempts,
                  error,
                  input,
                  operation,
                  defaultRetryable: false,
                }));

              if (canRetry) {
                lastError = error;
                await sleep(calculateBackoff(retryConf, attempt));
                continue;
              }

              return { ok: false, error };
            }

            try {
              const json = (await fetchResponse.json()) as
                | Response<any>
                | {
                    ok: false;
                    error: {
                      message?: string;
                      category?: string;
                      code?: string;
                      details?: Record<string, unknown>;
                    };
                  };
              if (!json.ok) {
                const error = new VdlError({
                  message: json.error.message ?? "Unknown error",
                  category: json.error.category,
                  code: json.error.code,
                  details: json.error.details,
                });
                const canRetry =
                  attempt < retryConf.maxAttempts &&
                  (await this.shouldRetry(retryConf, {
                    attempt,
                    maxAttempts: retryConf.maxAttempts,
                    error,
                    input,
                    operation,
                    defaultRetryable: false,
                  }));

                if (canRetry) {
                  lastError = error;
                  await sleep(calculateBackoff(retryConf, attempt));
                  continue;
                }

                return { ok: false, error };
              }

              return json;
            } catch (error) {
              const decodeError = new VdlError({
                message: "Failed to decode VDL response: " + String(error),
                category: "ClientError",
                code: "DECODE_RESPONSE",
              });
              const canRetry =
                attempt < retryConf.maxAttempts &&
                (await this.shouldRetry(retryConf, {
                  attempt,
                  maxAttempts: retryConf.maxAttempts,
                  error: decodeError,
                  input,
                  operation,
                  defaultRetryable: false,
                }));

              if (canRetry) {
                lastError = decodeError;
                await sleep(calculateBackoff(retryConf, attempt));
                continue;
              }

              return { ok: false, error: decodeError };
            }
          } catch (error) {
            if (timeoutId !== undefined) {
              clearTimeout(timeoutId);
            }
            opSignal?.removeEventListener("abort", onExternalAbort);

            if (opSignal?.aborted) {
              return {
                ok: false,
                error: new VdlError({
                  message: "Request aborted",
                  category: "ClientError",
                  code: "ABORTED",
                }),
              };
            }

            const normalizedError =
              abortController.signal.aborted && timeoutConf.timeoutMs > 0
                ? new VdlError({
                    message: "Request timeout",
                    category: "TimeoutError",
                    code: "REQUEST_TIMEOUT",
                    details: { attempt },
                  })
                : asError(error);

            const canRetry =
              attempt < retryConf.maxAttempts &&
              (await this.shouldRetry(retryConf, {
                attempt,
                maxAttempts: retryConf.maxAttempts,
                error: normalizedError,
                input,
                operation,
                defaultRetryable: true,
              }));

            if (canRetry) {
              lastError = normalizedError;
              await sleep(calculateBackoff(retryConf, attempt));
              continue;
            }

            return { ok: false, error: normalizedError };
          }
        }

        return {
          ok: false,
          error:
            lastError ??
            new VdlError({
              message: "Unknown error",
              category: "ClientError",
              code: "UNKNOWN",
            }),
        };
      };

      return this.executeChain(reqInfo, invoker) as Promise<Response<any>>;
    }

    callStream(
      rpcName: string,
      streamName: string,
      input: unknown,
      opHeaderProviders: HeaderProvider[],
      opReconnectConf?: ReconnectConfig,
      opMaxMessageSize?: number,
      onConnect?: () => void,
      onDisconnect?: (error: Error | null) => void,
      onReconnect?: (attempt: number, delayMs: number) => void,
      opSignal?: AbortSignal,
    ): {
      stream: AsyncGenerator<Response<any>, void, unknown>;
      cancel: () => void;
    } {
      const operation = this.getOperation(rpcName, streamName, "stream");
      const reqInfo: RequestInfo = {
        rpcName,
        operationName: streamName,
        input,
        type: "stream",
        operation,
      };
      const self = this;
      let isCancelled = false;
      let currentAbortController: AbortController | null = null;

      const cancel = () => {
        isCancelled = true;
        currentAbortController?.abort();
      };

      const onExternalAbort = () => {
        isCancelled = true;
        currentAbortController?.abort();
      };

      if (opSignal?.aborted) {
        isCancelled = true;
      }

      async function* generator(): AsyncGenerator<Response<any>, void, unknown> {
        let finalError: VdlError | null = null;
        if (opSignal && !opSignal.aborted) {
          opSignal.addEventListener("abort", onExternalAbort);
        }

        try {
          if (!operation) {
            yield {
              ok: false,
              error: new VdlError({
                message:
                  rpcName + "." + streamName + " stream not found in schema",
                category: "ClientError",
                code: "INVALID_STREAM",
                details: { rpc: rpcName, stream: streamName },
              }),
            };
            return;
          }

          let payload: string;
          try {
            payload = input == null ? "{}" : JSON.stringify(input);
          } catch (error) {
            finalError = asError(error);
            yield { ok: false, error: asError(finalError) };
            return;
          }

          const reconnectConf = self.mergeReconnectConfig(
            rpcName,
            opReconnectConf,
          );
          const maxMessageSize = self.mergeMaxMessageSize(
            rpcName,
            opMaxMessageSize,
          );
          const url = self.baseURL + "/" + rpcName + "/" + streamName;
          let reconnectAttempt = 0;

          while (!isCancelled) {
            currentAbortController = new AbortController();

            try {
              const headers: Record<string, string> = {
                "content-type": "application/json",
                accept: "text/event-stream",
              };

              await self.applyHeaders(rpcName, headers, opHeaderProviders);

              const fetchResponse = await self.fetchFn(url, {
                method: "POST",
                headers,
                body: payload,
                signal: currentAbortController.signal,
              });

              if (fetchResponse.status >= 500) {
                const error = new VdlError({
                  message:
                    "Unexpected HTTP status: " + String(fetchResponse.status),
                  category: "HTTPError",
                  code: "BAD_STATUS",
                  details: { status: fetchResponse.status },
                });
                const delayMs = calculateReconnectBackoff(
                  reconnectConf,
                  reconnectAttempt + 1,
                );
                const canReconnect =
                  reconnectAttempt < reconnectConf.maxAttempts &&
                  (await self.shouldReconnect(reconnectConf, {
                    attempt: reconnectAttempt + 1,
                    maxAttempts: reconnectConf.maxAttempts,
                    error,
                    input,
                    operation,
                    delayMs,
                    defaultReconnectable: true,
                  }));

                if (canReconnect) {
                  onReconnect?.(reconnectAttempt + 1, delayMs);
                  reconnectAttempt += 1;
                  await sleep(delayMs);
                  continue;
                }

                finalError = error;
                yield { ok: false, error };
                return;
              }

              if (!fetchResponse.ok) {
                const error = new VdlError({
                  message:
                    "Unexpected HTTP status: " + String(fetchResponse.status),
                  category: "HTTPError",
                  code: "BAD_STATUS",
                  details: { status: fetchResponse.status },
                });
                const delayMs = calculateReconnectBackoff(
                  reconnectConf,
                  reconnectAttempt + 1,
                );
                const canReconnect =
                  reconnectAttempt < reconnectConf.maxAttempts &&
                  (await self.shouldReconnect(reconnectConf, {
                    attempt: reconnectAttempt + 1,
                    maxAttempts: reconnectConf.maxAttempts,
                    error,
                    input,
                    operation,
                    delayMs,
                    defaultReconnectable: false,
                  }));

                if (canReconnect) {
                  onReconnect?.(reconnectAttempt + 1, delayMs);
                  reconnectAttempt += 1;
                  await sleep(delayMs);
                  continue;
                }

                finalError = error;
                yield { ok: false, error };
                return;
              }

              if (!fetchResponse.body) {
                const error = new VdlError({
                  message: "Missing response body for stream",
                  category: "ConnectionError",
                  code: "STREAM_CONNECT_FAILED",
                });
                finalError = error;
                yield { ok: false, error };
                return;
              }

              onConnect?.();
              reconnectAttempt = 0;

              const reader = fetchResponse.body.getReader();
              const decoder = new TextDecoder();
              let buffer = "";

              try {
                while (!isCancelled) {
                  const { done, value } = await reader.read();
                  if (done) {
                    break;
                  }

                  buffer += decoder.decode(value, { stream: true });

                  let separatorIndex = buffer.indexOf("\\n\\n");
                  while (separatorIndex >= 0) {
                    const chunk = buffer.slice(0, separatorIndex).trim();
                    buffer = buffer.slice(separatorIndex + 2);

                    if (chunk === "" || chunk.startsWith(":")) {
                      separatorIndex = buffer.indexOf("\\n\\n");
                      continue;
                    }

                    if (chunk.startsWith("data:")) {
                      const payloadText = chunk.slice(5).trim();
                      if (payloadText.length > maxMessageSize) {
                        finalError = new VdlError({
                          message:
                            "Stream message exceeded maximum size of " +
                            String(maxMessageSize) +
                            " bytes",
                          category: "ProtocolError",
                          code: "MESSAGE_TOO_LARGE",
                        });
                        yield { ok: false, error: asError(finalError) };
                        return;
                      }

                      try {
                        const event = JSON.parse(payloadText) as
                          | Response<any>
                          | {
                              ok: false;
                              error: {
                                message?: string;
                                category?: string;
                                code?: string;
                                details?: Record<string, unknown>;
                              };
                            };
                        if (!event.ok) {
                          yield {
                            ok: false,
                            error: new VdlError({
                              message: event.error.message ?? "Unknown error",
                              category: event.error.category,
                              code: event.error.code,
                              details: event.error.details,
                            }),
                          };
                        } else {
                          yield event;
                        }
                      } catch (error) {
                        finalError = new VdlError({
                          message:
                            "Received invalid SSE payload: " + String(error),
                          category: "ProtocolError",
                          code: "INVALID_PAYLOAD",
                        });
                        yield { ok: false, error: asError(finalError) };
                        return;
                      }
                    }

                    if (buffer.length > maxMessageSize) {
                      finalError = new VdlError({
                        message:
                          "Stream message accumulation exceeded maximum size of " +
                          String(maxMessageSize) +
                          " bytes",
                        category: "ProtocolError",
                        code: "MESSAGE_TOO_LARGE",
                      });
                      yield { ok: false, error: asError(finalError) };
                      return;
                    }

                    separatorIndex = buffer.indexOf("\\n\\n");
                  }
                }

                return;
              } catch (error) {
                const normalizedError = asError(error);
                const delayMs = calculateReconnectBackoff(
                  reconnectConf,
                  reconnectAttempt + 1,
                );
                const canReconnect =
                  !isCancelled &&
                  reconnectAttempt < reconnectConf.maxAttempts &&
                  (await self.shouldReconnect(reconnectConf, {
                    attempt: reconnectAttempt + 1,
                    maxAttempts: reconnectConf.maxAttempts,
                    error: normalizedError,
                    input,
                    operation,
                    delayMs,
                    defaultReconnectable: true,
                  }));

                if (canReconnect) {
                  onReconnect?.(reconnectAttempt + 1, delayMs);
                  reconnectAttempt += 1;
                  await sleep(delayMs);
                  continue;
                }

                finalError = normalizedError;
                yield { ok: false, error: normalizedError };
                return;
              }
            } catch (error) {
              const normalizedError = asError(error);
              const delayMs = calculateReconnectBackoff(
                reconnectConf,
                reconnectAttempt + 1,
              );
              const canReconnect =
                !isCancelled &&
                reconnectAttempt < reconnectConf.maxAttempts &&
                (await self.shouldReconnect(reconnectConf, {
                  attempt: reconnectAttempt + 1,
                  maxAttempts: reconnectConf.maxAttempts,
                  error: normalizedError,
                  input,
                  operation,
                  delayMs,
                  defaultReconnectable: true,
                }));

              if (canReconnect) {
                onReconnect?.(reconnectAttempt + 1, delayMs);
                reconnectAttempt += 1;
                await sleep(delayMs);
                continue;
              }

              finalError = normalizedError;
              if (!isCancelled) {
                yield { ok: false, error: normalizedError };
              }
              return;
            }
          }
        } finally {
          opSignal?.removeEventListener("abort", onExternalAbort);
          onDisconnect?.(finalError);
        }
      }

      const wrappedGenerator = async function* () {
        const result = await self.executeChain(reqInfo, async () => ({
          ok: true,
          output: null,
        }));
        if (!result.ok) {
          yield result;
          return;
        }
        yield* generator();
      };

      return {
        stream: wrappedGenerator(),
        cancel,
      };
    }
  }

  type internalClientOption = (client: internalClient) => void;

  function withFetch(fetchFn: FetchLike): internalClientOption {
    return (client) => client.setFetch(fetchFn);
  }

  function withGlobalHeader(key: string, value: string): internalClientOption {
    return (client) =>
      client.addHeaderProvider((headers) => {
        headers[key] = value;
      });
  }

  function withHeaderProvider(provider: HeaderProvider): internalClientOption {
    return (client) => client.addHeaderProvider(provider);
  }

  function withInterceptor(interceptor: Interceptor): internalClientOption {
    return (client) => client.addInterceptor(interceptor);
  }

  function withGlobalRetryConfig(conf: RetryConfig): internalClientOption {
    return (client) => client.setGlobalRetryConfig(conf);
  }

  function withGlobalTimeoutConfig(conf: TimeoutConfig): internalClientOption {
    return (client) => client.setGlobalTimeoutConfig(conf);
  }

  function withGlobalReconnectConfig(
    conf: ReconnectConfig,
  ): internalClientOption {
    return (client) => client.setGlobalReconnectConfig(conf);
  }

  function withGlobalMaxMessageSize(size: number): internalClientOption {
    return (client) => client.setGlobalMaxMessageSize(size);
  }

  class clientBuilder {
    private readonly baseURL: string;
    private readonly procDefs: OperationDefinition[];
    private readonly streamDefs: OperationDefinition[];
    private readonly opts: internalClientOption[] = [];

    constructor(
      baseURL: string,
      procDefs: OperationDefinition[],
      streamDefs: OperationDefinition[],
    ) {
      this.baseURL = baseURL;
      this.procDefs = procDefs;
      this.streamDefs = streamDefs;
    }

    withFetch(fetchFn: FetchLike): clientBuilder {
      this.opts.push(withFetch(fetchFn));
      return this;
    }

    withGlobalHeader(key: string, value: string): clientBuilder {
      this.opts.push(withGlobalHeader(key, value));
      return this;
    }

    withHeaderProvider(provider: HeaderProvider): clientBuilder {
      this.opts.push(withHeaderProvider(provider));
      return this;
    }

    withInterceptor(interceptor: Interceptor): clientBuilder {
      this.opts.push(withInterceptor(interceptor));
      return this;
    }

    withGlobalRetryConfig(conf: RetryConfig): clientBuilder {
      this.opts.push(withGlobalRetryConfig(conf));
      return this;
    }

    withGlobalTimeoutConfig(conf: TimeoutConfig): clientBuilder {
      this.opts.push(withGlobalTimeoutConfig(conf));
      return this;
    }

    withGlobalReconnectConfig(conf: ReconnectConfig): clientBuilder {
      this.opts.push(withGlobalReconnectConfig(conf));
      return this;
    }

    withGlobalMaxMessageSize(size: number): clientBuilder {
      this.opts.push(withGlobalMaxMessageSize(size));
      return this;
    }

    build(): internalClient {
      return new internalClient(
        this.baseURL,
        this.procDefs,
        this.streamDefs,
        this.opts,
      );
    }
  }
`);
