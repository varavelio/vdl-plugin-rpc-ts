// Verifies error handler precedence: RPC-level error handlers override global handlers.
// Users.Get uses global handler ("Global: fail"), Auth.Login uses RPC-specific handler ("Auth: fail").

import { createServer } from "node:http";
import { createNodeHandler } from "./gen/adapters/node.ts";
import { NewClient, VdlError } from "./gen/client.ts";
import { Server } from "./gen/server.ts";

async function main() {
  const server = new Server();

  // Set global error handler
  server.setErrorHandler((_ctx, err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    return new VdlError({ message: `Global: ${error.message}` });
  });

  // Set RPC-specific error handler for Auth
  server.rpcs.auth().setErrorHandler((_ctx, err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    return new VdlError({ message: `Auth: ${error.message}` });
  });

  // Users.Get will use global handler
  server.rpcs
    .users()
    .procs.get()
    .handle(async () => {
      throw new Error("fail");
    });

  // Auth.Login will use RPC-specific handler
  server.rpcs
    .auth()
    .procs.login()
    .handle(async () => {
      throw new Error("fail");
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

  // Test Users.Get - should use global handler
  try {
    await client.procs.usersGet().execute({});
    console.error("Expected error for Users.Get, got success");
    process.exit(1);
  } catch (e) {
    if (!(e instanceof VdlError)) {
      console.error("Expected VdlError for Users.Get, got:", e);
      process.exit(1);
    }
    if (e.message !== "Global: fail") {
      console.error(`Expected 'Global: fail', got '${e.message}'`);
      process.exit(1);
    }
  }

  // Test Auth.Login - should use RPC-specific handler
  try {
    await client.procs.authLogin().execute({});
    console.error("Expected error for Auth.Login, got success");
    process.exit(1);
  } catch (e) {
    if (!(e instanceof VdlError)) {
      console.error("Expected VdlError for Auth.Login, got:", e);
      process.exit(1);
    }
    if (e.message !== "Auth: fail") {
      console.error(`Expected 'Auth: fail', got '${e.message}'`);
      process.exit(1);
    }
  }

  console.log("Success");

  httpServer.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
