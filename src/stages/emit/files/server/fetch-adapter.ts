import { newGenerator } from "@varavel/gen";
import type { PluginOutputFile } from "@varavel/vdl-plugin-sdk";
import { dedent } from "@varavel/vdl-plugin-sdk/utils/strings";
import { formatImportPath } from "../../../../shared/imports";
import { renderTypeScriptFile } from "../../../../shared/render-ts-file";
import type { GeneratorContext } from "../../../model/types";

/**
 * Emits the Fetch API adapter used by the generated server target.
 */
export function generateFetchAdapterFile(
  context: GeneratorContext,
): PluginOutputFile {
  const g = newGenerator().withSpaces(2);

  g.line(
    `import type { HTTPAdapter, Server } from ${JSON.stringify(formatImportPath("../server", context.options.importExtension))};`,
  );
  g.break();
  g.raw(FETCH_ADAPTER.trim());

  return {
    path: "adapters/fetch.ts",
    content: renderTypeScriptFile(g.toString()),
  };
}

const FETCH_ADAPTER = dedent(/* ts */ `
  /**
   * FetchAdapter implements HTTPAdapter for Web Standards environments.
   */
  export class FetchAdapter implements HTTPAdapter {
    private readonly request: Request;
    private readonly headers: Map<string, string>;
    private readonly chunks: string[];
    private streamController: ReadableStreamDefaultController<Uint8Array> | null;
    private readonly encoder: TextEncoder;
    private readonly closeCallbacks: Array<() => void>;
    private aborted: boolean;

    constructor(request: Request) {
      this.request = request;
      this.headers = new Map();
      this.chunks = [];
      this.streamController = null;
      this.encoder = new TextEncoder();
      this.closeCallbacks = [];
      this.aborted = false;

      request.signal.addEventListener("abort", () => {
        this.aborted = true;
        for (const callback of this.closeCallbacks) {
          callback();
        }
      });
    }

    /** Returns the parsed JSON request body. */
    async json(): Promise<unknown> {
      return this.request.json();
    }

    /** Sets a response header. */
    setHeader(key: string, value: string): void {
      this.headers.set(key, value);
    }

    /** Writes data to the buffered or streaming response body. */
    write(data: string): void {
      if (this.aborted) {
        return;
      }

      if (this.streamController) {
        this.streamController.enqueue(this.encoder.encode(data));
        return;
      }

      this.chunks.push(data);
    }

    /** Flushes buffered response data. */
    flush(): void {}

    /** Ends the response. */
    end(): void {
      if (this.streamController) {
        try {
          this.streamController.close();
        } catch {
          // The controller may already be closed.
        }
      }

      for (const callback of this.closeCallbacks) {
        callback();
      }
    }

    /** Registers a callback for when the request is aborted. */
    onClose(callback: () => void): void {
      this.closeCallbacks.push(callback);
      if (this.aborted) {
        callback();
      }
    }

    /** Builds a buffered JSON response after a procedure completes. */
    toResponse(): Response {
      return new Response(this.chunks.join(""), {
        status: 200,
        headers: Object.fromEntries(this.headers),
      });
    }

    /** Builds a streaming SSE response before a stream starts writing events. */
    toStreamingResponse(): Response {
      const stream = new ReadableStream<Uint8Array>({
        start: (controller) => {
          this.streamController = controller;
        },
        cancel: () => {
          this.aborted = true;
          for (const callback of this.closeCallbacks) {
            callback();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: Object.fromEntries(this.headers),
      });
    }
  }

  /**
   * Extracts RPC name and operation name from a URL path.
   */
  export function parseRpcPath(
    url: string | URL,
    prefix?: string,
  ): { rpcName: string; operationName: string } | null {
    const parsedUrl = typeof url === "string" ? new URL(url) : url;
    let pathname = parsedUrl.pathname;

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
   * Options for createFetchHandler.
   */
  export interface FetchHandlerOptions {
    /**
     * URL path prefix to strip before parsing RPC/operation names.
     * Example: "/rpc" or "/api/v1"
     */
    prefix?: string;
  }

  /**
   * Creates a Fetch API compatible request handler for a VDL Server.
   *
   * This handler can be used directly with:
   * - Bun.serve()
   * - Deno.serve()
   * - Cloudflare Workers fetch handler
   * - Any Web Standards compatible runtime
   *
   * @example
   * \`\`\`typescript
   * const server = new Server<MyContext>();
   * // ... register handlers ...
   *
   * const handler = createFetchHandler(server, {
   *   prefix: "/rpc",
   * });
   *
   * // Bun
   * Bun.serve({ fetch: handler });
   *
   * // Deno
   * Deno.serve(handler);
   *
   * // Cloudflare Workers
   * export default { fetch: handler };
   * \`\`\`
   *
   * @param server - The VDL Server instance
   * @param createContext - Optional function to create the context (props) from the request
   * @param options - Handler options including path prefix
   * @returns A function that handles Fetch API requests
   */
  export function createFetchHandler<T = unknown>(
    server: Server<T>,
    createContext?: (req: Request) => T | Promise<T>,
    options?: FetchHandlerOptions,
  ): (req: Request) => Promise<Response> {
    const prefix = options?.prefix;

    return async (req: Request): Promise<Response> => {
      const parsed = parseRpcPath(req.url, prefix);
      if (!parsed) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "NOT_FOUND",
              message:
                "Invalid RPC path. Expected: /[prefix/]rpcName/operationName",
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      let props: T;
      try {
        props = createContext ? await createContext(req) : (undefined as T);
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "CONTEXT_ERROR",
              message: "Failed to create request context",
              details: { originalError: String(error) },
            },
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const adapter = new FetchAdapter(req);
      const acceptHeader = req.headers.get("Accept") ?? "";
      const isStreamRequest = acceptHeader.includes("text/event-stream");

      if (isStreamRequest) {
        const response = adapter.toStreamingResponse();
        server
          .handleRequest(props, parsed.rpcName, parsed.operationName, adapter)
          .catch(() => {
            adapter.end();
          });
        return response;
      }

      try {
        await server.handleRequest(
          props,
          parsed.rpcName,
          parsed.operationName,
          adapter,
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "Internal server error",
              details: { originalError: String(error) },
            },
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return adapter.toResponse();
    };
  }
`);
