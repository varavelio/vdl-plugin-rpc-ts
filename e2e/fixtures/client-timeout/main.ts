// Verifies client timeout configuration: the server handler sleeps for 500ms,
// but the client is configured with a 100ms timeout, so it should fail with REQUEST_TIMEOUT.

import { createServer } from "node:http";
import { createNodeHandler } from "./gen/adapters/node.ts";
import { NewClient, VdlError } from "./gen/client.ts";
import { Server } from "./gen/server.ts";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const server = new Server();

  server.rpcs
    .service()
    .procs.slow()
    .handle(async ({ input }) => {
      await sleep(500);
      return {};
    });

  const handler = createNodeHandler(server, undefined, { prefix: "/rpc" });

  const httpServer = createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }

    await handler(req, res);
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(0, resolve);
  });

  const addr = httpServer.address() as any;
  const port = addr.port;
  const baseUrl = `http://localhost:${port}/rpc`;

  const client = NewClient(baseUrl).build();

  const start = Date.now();
  try {
    await client.rpcs
      .service()
      .procs.slow()
      .withTimeout({ timeoutMs: 100 })
      .execute({});

    console.error("expected timeout error, got success");
    process.exit(1);
  } catch (e) {
    const duration = Date.now() - start;

    if (!(e instanceof VdlError)) {
      console.error(`expected VdlError, got ${typeof e}:`, e);
      process.exit(1);
    }

    if (e.code !== "REQUEST_TIMEOUT") {
      console.error(`expected error code REQUEST_TIMEOUT, got ${e.code}`);
      process.exit(1);
    }

    // Client should have timed out well before 300ms
    if (duration > 300) {
      console.error(`client waited too long: ${duration}ms`);
      process.exit(1);
    }

    console.log("Success");
  }

  httpServer.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
