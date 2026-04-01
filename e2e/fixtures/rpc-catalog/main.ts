// Verifies VDLPaths, VDLProcedures, and VDLStreams catalog exports.
import { VDLPaths, VDLProcedures, VDLStreams } from "./gen/client.ts";

function fail(name: string, expected: string, actual: string): never {
  console.error(`${name} mismatch: expected "${expected}", got "${actual}"`);
  process.exit(1);
}

function main() {
  // Verify VDLPaths structure (only procs and streams, no service root path)
  if (VDLPaths.MyService.myProc !== "/MyService/myProc") {
    fail(
      "VDLPaths.MyService.myProc",
      "/MyService/myProc",
      VDLPaths.MyService.myProc,
    );
  }
  if (VDLPaths.MyService.myStream !== "/MyService/myStream") {
    fail(
      "VDLPaths.MyService.myStream",
      "/MyService/myStream",
      VDLPaths.MyService.myStream,
    );
  }

  // Verify VDLProcedures contains MyProc
  let foundProc = false;
  for (const op of VDLProcedures) {
    if (op.rpcName === "MyService" && op.name === "myProc") {
      foundProc = true;
      // Verify path method
      const expectedPath = "/MyService/myProc";
      const actualPath = `/${op.rpcName}/${op.name}`;
      if (actualPath !== expectedPath) {
        fail("op path for MyProc", expectedPath, actualPath);
      }
    }
  }
  if (!foundProc) {
    console.error("MyProc operation not found in VDLProcedures");
    process.exit(1);
  }

  // Verify VDLStreams contains MyStream
  let foundStream = false;
  for (const op of VDLStreams) {
    if (op.rpcName === "MyService" && op.name === "myStream") {
      foundStream = true;
      // Verify path method
      const expectedPath = "/MyService/myStream";
      const actualPath = `/${op.rpcName}/${op.name}`;
      if (actualPath !== expectedPath) {
        fail("op path for MyStream", expectedPath, actualPath);
      }
    }
  }
  if (!foundStream) {
    console.error("MyStream operation not found in VDLStreams");
    process.exit(1);
  }

  console.log("Paths verification successful");
  process.exit(0);
}

main();
