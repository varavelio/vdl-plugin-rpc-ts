// Verifies procs with empty input/output (void operations) work correctly.

import { createServer } from "node:http";
import { createNodeHandler } from "./gen/adapters/node.ts";
import { NewClient } from "./gen/client.ts";
import { Server } from "./gen/server.ts";

async function main() {
  const server = new Server();

  let wasCalled = false;
  server.rpcs
    .service()
    .procs.ping()
    .handle(async () => {
      wasCalled = true;
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

  // Call void operation - should succeed without error
  await client.rpcs.service().procs.ping().execute({});

  if (!wasCalled) {
    throw new Error("RPC handler was not called");
  }

  console.log("Success");
  httpServer.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
