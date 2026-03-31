import { newGenerator } from "@varavel/gen";
import type { PluginOutputFile } from "@varavel/vdl-plugin-sdk";
import { dedent } from "@varavel/vdl-plugin-sdk/utils/strings";
import { formatImportPath } from "../../../../shared/imports";
import { renderTypeScriptFile } from "../../../../shared/render-ts-file";
import type { GeneratorContext } from "../../../model/types";

/**
 * Emits the Node.js server adapter used by the generated server target.
 */
export function generateNodeAdapterFile(
  context: GeneratorContext,
): PluginOutputFile {
  const g = newGenerator().withSpaces(2);

  g.line(
    `import type { HTTPAdapter, Server } from ${JSON.stringify(formatImportPath("../server", context.options.importExtension))};`,
  );
  g.line('import type { IncomingMessage, ServerResponse } from "node:http";');
  g.break();
  g.raw(NODE_ADAPTER.trim());

  return {
    path: "adapters/node.ts",
    content: renderTypeScriptFile(g.toString()),
  };
}

const NODE_ADAPTER = dedent(/* ts */ `
  /**
   * NodeAdapter implements HTTPAdapter for Node.js HTTP environments.
   *
   * This adapter works with Node.js \`IncomingMessage\` and \`ServerResponse\` objects
   * used by Express, Fastify, native \`http.createServer\`, and similar frameworks.
   *
   * It supports:
   * - JSON body parsing (manual buffering or pre-parsed by middleware)
   * - Streaming responses (SSE)
   * - Connection close detection
   */
  export class NodeAdapter implements HTTPAdapter {
    private readonly req: IncomingMessage;
    private readonly res: ServerResponse;
    private readonly parsedBody: unknown;
    private bodyPromise: Promise<unknown> | null;
    private readonly closeCallbacks: Array<() => void>;
    private closed: boolean;

    /**
     * Creates a new NodeAdapter.
     *
     * @param req - The Node.js IncomingMessage (request)
     * @param res - The Node.js ServerResponse
     * @param parsedBody - Optional pre-parsed body (from Express body-parser, etc.)
     */
    constructor(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown) {
      this.req = req;
      this.res = res;
      this.parsedBody = parsedBody;
      this.bodyPromise = null;
      this.closeCallbacks = [];
      this.closed = false;

      // Listen for premature client disconnect (aborted connection)
      // The 'close' event on res fires when the underlying connection is closed
      // We use 'aborted' on req to detect if the client closed the connection early
      req.on("aborted", () => {
        this.closed = true;
        for (const callback of this.closeCallbacks) {
          callback();
        }
      });

      // The 'close' event on res is fired when the response has been sent
      // OR when the underlying connection is closed before finishing
      // We only care about premature closes, not normal completion
      res.on("close", () => {
        // Only mark closed if we haven't finished writing
        if (!this.res.writableFinished) {
          this.closed = true;
          for (const callback of this.closeCallbacks) {
            callback();
          }
        }
      });

      // If no pre-parsed body, start buffering immediately to avoid missing data events
      if (parsedBody === undefined) {
        this.startBodyBuffering();
      }
    }

    /** Starts buffering the request body immediately. */
    private startBodyBuffering(): void {
      const chunks: Buffer[] = [];

      this.bodyPromise = new Promise<unknown>((resolve, reject) => {
        this.req.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        this.req.on("end", () => {
          try {
            const bodyString = Buffer.concat(chunks).toString("utf-8");
            if (!bodyString || bodyString.trim() === "") {
              resolve({});
              return;
            }

            resolve(JSON.parse(bodyString));
          } catch (error) {
            reject(new Error("Failed to parse JSON body: " + String(error)));
          }
        });

        this.req.on("error", (error) => {
          reject(error);
        });
      });
    }

    /** Returns the parsed JSON request body. */
    async json(): Promise<unknown> {
      if (this.parsedBody !== undefined) {
        return this.parsedBody;
      }

      return this.bodyPromise ?? {};
    }

    /** Sets a response header. */
    setHeader(key: string, value: string): void {
      if (!this.res.headersSent) {
        this.res.setHeader(key, value);
      }
    }

    /** Writes data to the response body. */
    write(data: string): void {
      if (this.closed || this.res.writableEnded) {
        return;
      }

      this.res.write(data);
    }

    /** Flushes buffered response data when the host supports it. */
    flush(): void {
      if (this.closed || this.res.writableEnded) {
        return;
      }

      const response = this.res as ServerResponse & {
        flush?: () => void;
        flushHeaders?: () => void;
      };

      response.flush?.();

      if (!this.res.headersSent) {
        response.flushHeaders?.();
      }
    }

    /** Ends the response. */
    end(): void {
      if (!this.res.writableEnded) {
        this.res.end();
      }
    }

    /** Registers a callback for when the underlying connection closes. */
    onClose(callback: () => void): void {
      this.closeCallbacks.push(callback);
      if (this.closed) {
        callback();
      }
    }
  }

  /**
   * Extracts RPC name and operation name from a URL path.
   *
   * @param url - The request URL (e.g., "/rpc/Service/Echo")
   * @param prefix - Optional path prefix to strip (e.g., "/rpc")
   * @returns Object with rpcName and operationName, or null if parsing fails
   */
  export function parseNodeRpcPath(
    url: string,
    prefix?: string,
  ): { rpcName: string; operationName: string } | null {
    let pathname = url.split("?")[0] ?? url;

    if (prefix) {
      const normalizedPrefix = prefix.startsWith("/") ? prefix : "/" + prefix;
      if (pathname.startsWith(normalizedPrefix)) {
        pathname = pathname.slice(normalizedPrefix.length);
      }
    }

    const segments = pathname.replace(/^\\/+|\\/+$/gu, "").split("/");
    if (segments.length < 2) {
      return null;
    }

    const operationName = segments.pop();
    const rpcName = segments.pop();
    if (!rpcName || !operationName) {
      return null;
    }

    return { rpcName, operationName };
  }

/**
 * Options for createNodeHandler.
 */
export interface NodeHandlerOptions {
  /**
   * URL path prefix to strip before parsing RPC/operation names.
   * Example: "/rpc" or "/api/v1"
   */
  prefix?: string;
}

  /**
   * Creates a Node.js HTTP request handler for a VDL Server.
   *
   * This handler can be used with:
   * - Native \`http.createServer()\`
   * - Express: \`app.use('/rpc', handler)\` or \`app.all('/rpc/*', handler)\`
   * - Fastify: \`fastify.all('/rpc/*', handler)\`
   * - Any Node.js HTTP framework
   *
   * @example
   * \`\`\`typescript
   * import { createServer } from "http";
   * import { Server } from "./gen/server";
   * import { createNodeHandler } from "./gen/adapters/node";
   *
   * const server = new Server<MyContext>();
   * // ... register handlers ...
   *
   * const handler = createNodeHandler(server, {
   *   prefix: "/rpc",
   * });
   *
   * // Native http
   * createServer(async (req, res) => {
   *   await handler(req, res);
   * }).listen(3000);
   *
   * // Express
   * app.use('/rpc', async (req, res, next) => {
   *   try {
   *     await handler(req, res);
   *   } catch (err) {
   *     next(err);
   *   }
   * });
   * \`\`\`
   *
   * @param server - The VDL Server instance
   * @param createContext - Optional function to create the context (props) from req/res
   * @param options - Handler options including path prefix
   * @returns An async function that handles Node.js HTTP requests
   */
  export function createNodeHandler<T = unknown>(
    server: Server<T>,
    createContext?: (req: IncomingMessage, res: ServerResponse) => T | Promise<T>,
    options?: NodeHandlerOptions,
  ): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
    const prefix = options?.prefix;

    return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      const parsed = parseNodeRpcPath(req.url ?? "/", prefix);
      if (!parsed) {
        if (!res.headersSent) {
          res.writeHead(404, { "Content-Type": "application/json" });
        }

        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: "NOT_FOUND",
              message:
                "Invalid RPC path. Expected: /[prefix/]rpcName/operationName",
            },
          }),
        );
        return;
      }

      const reqWithBody = req as IncomingMessage & { body?: unknown };
      const adapter = new NodeAdapter(req, res, reqWithBody.body);

      let props: T;
      try {
        props = createContext
          ? await createContext(req, res)
          : (undefined as T);
      } catch (error) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
        }

        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: "CONTEXT_ERROR",
              message: "Failed to create request context",
              details: { originalError: String(error) },
            },
          }),
        );
        return;
      }

      try {
        await server.handleRequest(
          props,
          parsed.rpcName,
          parsed.operationName,
          adapter,
        );
      } catch (error) {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
        }

        if (!res.writableEnded) {
          res.end(
            JSON.stringify({
              ok: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "Internal server error",
                details: { originalError: String(error) },
              },
            }),
          );
        }
      }
    };
  }
`);
