// Verifies SSE payload escaping: messages with newlines, unicode,
// and special characters should be correctly transmitted through SSE.

import { createServer } from "node:http";
import { createNodeHandler } from "./gen/adapters/node.ts";
import { NewClient } from "./gen/client.ts";
import { Server } from "./gen/server.ts";

const testMessages = [
  "simple message",
  "message with\nnewline",
  "message with\r\nCRLF",
  "message with\ttab",
  "unicode: 你好世界 🎉 émojis",
  `message with "quotes" and 'apostrophes'`,
  "message with backslash: \\path\\to\\file",
  "message with special chars: <>&",
  "multi\nline\nmessage\nwith\nmany\nbreaks",
  "",
];

async function main() {
  const server = new Server();

  server.rpcs
    .service()
    .streams.events()
    .handle(async (c, emit) => {
      for (const msg of testMessages) {
        await emit(c, { message: msg });
      }
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
  const baseUrl = `http://localhost:${addr.port}/rpc`;
  const client = NewClient(baseUrl).build();

  try {
    const { stream } = client.rpcs.service().streams.events().execute({});

    const received: string[] = [];
    for await (const event of stream) {
      if (!event.ok) {
        console.error("stream error:", event.error);
        process.exit(1);
      }
      received.push(event.output.message);
    }

    if (received.length !== testMessages.length) {
      console.error(
        `expected ${testMessages.length} messages, got ${received.length}`,
      );
      process.exit(1);
    }

    for (let i = 0; i < testMessages.length; i++) {
      if (received[i] !== testMessages[i]) {
        console.error(
          `message ${i} mismatch:\nexpected: ${JSON.stringify(testMessages[i])}\ngot: ${JSON.stringify(received[i])}`,
        );
        process.exit(1);
      }
    }

    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }

  httpServer.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
