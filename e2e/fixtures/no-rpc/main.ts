import * as fs from "node:fs";
import * as path from "node:path";
import type { Something } from "./gen/index.ts";

function main() {
  const s: Something = { field: "value" };
  if (s.field !== "value") throw new Error("field mismatch");

  const clientCatalogPath = path.join(
    process.cwd(),
    "gen",
    "client",
    "catalog.ts",
  );
  const serverCatalogPath = path.join(
    process.cwd(),
    "gen",
    "server",
    "catalog.ts",
  );
  if (fs.existsSync(clientCatalogPath) || fs.existsSync(serverCatalogPath)) {
    throw new Error(
      "catalog.ts should not exist for RPC targets when there are no RPC services",
    );
  }

  console.log("Success");
}

main();
