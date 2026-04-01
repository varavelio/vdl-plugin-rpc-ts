// Verifies that the client properly validates enum values BEFORE sending requests.
// This tests client-side validation, which catches invalid enums without making network calls.

import { createServer } from "node:http";
import { createNodeHandler } from "./gen/adapters/node.ts";
import { NewClient, VdlError } from "./gen/client.ts";
import { Server } from "./gen/server.ts";

async function main() {
  const server = new Server();

  // Register all handlers that simply echo the input
  // These should NEVER be called for invalid inputs (client validates first)
  server.rpcs
    .service()
    .procs.echoColor()
    .handle(async ({ input }) => ({ color: input.color }));

  server.rpcs
    .service()
    .procs.echoPriority()
    .handle(async ({ input }) => ({ priority: input.priority }));

  server.rpcs
    .service()
    .procs.echoSettings()
    .handle(async ({ input }) => ({ settings: input.settings }));

  server.rpcs
    .service()
    .procs.echoOptional()
    .handle(async ({ input }) => ({ settings: input.settings }));

  server.rpcs
    .service()
    .procs.echoPalette()
    .handle(async ({ input }) => ({ palette: input.palette }));

  server.rpcs
    .service()
    .procs.echoColorMap()
    .handle(async ({ input }) => ({ colorMap: input.colorMap }));

  server.rpcs
    .service()
    .procs.echoNested()
    .handle(async ({ input }) => ({ nested: input.nested }));

  server.rpcs
    .service()
    .streams.colorStream()
    .handle(async (c, emit) => {
      await emit(c, { color: c.input.color });
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

  try {
    // ========== Test 1: Valid enum values should work ==========
    console.log("Test 1: Valid enum values...");
    const colorRes = await client.rpcs
      .service()
      .procs.echoColor()
      .execute({ color: "Red" });
    if (colorRes.color !== "Red")
      throw new Error(`Expected "Red", got ${colorRes.color}`);

    const priorityRes = await client.rpcs
      .service()
      .procs.echoPriority()
      .execute({ priority: 2 });
    if (priorityRes.priority !== 2)
      throw new Error(`Expected 2, got ${priorityRes.priority}`);
    console.log("  PASS: Valid enum values work");

    // ========== Test 2: Invalid string enum value should be rejected by client ==========
    console.log("Test 2: Client rejects invalid string enum...");
    try {
      await client.rpcs
        .service()
        .procs.echoColor()
        .execute({ color: "Purple" as any });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Color");
    }
    console.log("  PASS: Client rejects invalid string enum");

    // ========== Test 3: Invalid integer enum value should be rejected by client ==========
    console.log("Test 3: Client rejects invalid integer enum...");
    try {
      await client.rpcs
        .service()
        .procs.echoPriority()
        .execute({ priority: 99 as any });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Priority");
    }
    console.log("  PASS: Client rejects invalid integer enum");

    // ========== Test 4: Invalid enum in nested type should be rejected by client ==========
    console.log("Test 4: Client rejects invalid enum in nested type...");
    try {
      await client.rpcs
        .service()
        .procs.echoSettings()
        .execute({
          settings: {
            color: "Yellow" as any, // Invalid!
            priority: 1,
          },
        });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Color");
    }
    console.log("  PASS: Client rejects invalid enum in nested type");

    // ========== Test 5: Valid optional enums (missing) should work ==========
    console.log("Test 5: Valid optional enums (missing)...");
    const optRes = await client.rpcs
      .service()
      .procs.echoOptional()
      .execute({ settings: {} });
    if (optRes.settings.color !== undefined)
      throw new Error("Expected undefined color");
    console.log("  PASS: Optional enums work when missing");

    // ========== Test 6: Invalid optional enum should be rejected by client ==========
    console.log("Test 6: Client rejects invalid optional enum...");
    try {
      await client.rpcs
        .service()
        .procs.echoOptional()
        .execute({
          settings: { color: "Orange" as any }, // Invalid!
        });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Color");
    }
    console.log("  PASS: Client rejects invalid optional enum");

    // ========== Test 7: Valid enum arrays should work ==========
    console.log("Test 7: Valid enum arrays...");
    const paletteRes = await client.rpcs
      .service()
      .procs.echoPalette()
      .execute({
        palette: {
          colors: ["Red", "Green", "Blue"],
          priorities: [1, 2, 3],
        },
      });
    if (paletteRes.palette.colors.length !== 3)
      throw new Error("Expected 3 colors");
    console.log("  PASS: Valid enum arrays work");

    // ========== Test 8: Invalid enum in array should be rejected by client ==========
    console.log("Test 8: Client rejects invalid enum in array...");
    try {
      await client.rpcs
        .service()
        .procs.echoPalette()
        .execute({
          palette: {
            colors: ["Red", "Magenta" as any, "Blue"], // Invalid!
            priorities: [1, 2, 3],
          },
        });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Color");
    }
    console.log("  PASS: Client rejects invalid enum in array");

    // ========== Test 9: Valid enum maps should work ==========
    console.log("Test 9: Valid enum maps...");
    const mapRes = await client.rpcs
      .service()
      .procs.echoColorMap()
      .execute({
        colorMap: {
          colorByName: { primary: "Red", secondary: "Blue" },
          priorityByTask: { task1: 1, task2: 2 },
        },
      });
    if (mapRes.colorMap.colorByName.primary !== "Red")
      throw new Error("Expected Red");
    console.log("  PASS: Valid enum maps work");

    // ========== Test 10: Invalid enum in map should be rejected by client ==========
    console.log("Test 10: Client rejects invalid enum in map...");
    try {
      await client.rpcs
        .service()
        .procs.echoColorMap()
        .execute({
          colorMap: {
            colorByName: { primary: "Cyan" as any }, // Invalid!
            priorityByTask: { task1: 1 },
          },
        });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Color");
    }
    console.log("  PASS: Client rejects invalid enum in map");

    // ========== Test 11: Deeply nested invalid enum should be rejected by client ==========
    console.log("Test 11: Client rejects deeply nested invalid enum...");
    try {
      await client.rpcs
        .service()
        .procs.echoNested()
        .execute({
          nested: {
            settings: {
              color: "Red",
              priority: 999 as any, // Invalid!
            },
          },
        });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Priority");
    }
    console.log("  PASS: Client rejects deeply nested invalid enum");

    // ========== Test 12: Invalid enum in stream should be rejected by client ==========
    console.log("Test 12: Client rejects invalid enum in stream...");
    try {
      client.rpcs
        .service()
        .streams.colorStream()
        .execute({ color: "Pink" as any });
      throw new Error("Expected client to reject invalid enum");
    } catch (e) {
      assertClientValidationError(e, "Color");
    }
    console.log("  PASS: Client rejects invalid enum in stream");

    console.log("\nSuccess: All client-side enum validation tests passed!");
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }

  httpServer.close();
  process.exit(0);
}

function assertClientValidationError(e: unknown, expectedEnumName: string) {
  if (!(e instanceof VdlError)) {
    throw new Error(`Expected VdlError, got: ${e}`);
  }
  if (e.code !== "INVALID_INPUT") {
    throw new Error(
      `Expected INVALID_INPUT error code, got: ${e.code} (message: ${e.message})`,
    );
  }
  if (!e.message.includes(expectedEnumName)) {
    throw new Error(
      `Expected error message to mention "${expectedEnumName}", got: ${e.message}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
