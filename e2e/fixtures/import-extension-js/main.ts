// Verifies that importExtension: "js" generates correct import paths.
import { readFileSync } from "node:fs";

async function main() {
  // =========================================================================
  // Step 1: Verify generated imports have .js extension
  // =========================================================================
  // Tests run from the case directory, so ./gen is correct
  const filesToCheck = [
    "./gen/client.ts",
    "./gen/client.ts",
    "./gen/server.ts",
    "./gen/server.ts",
    "./gen/index.ts",
  ];

  for (const file of filesToCheck) {
    const content = readFileSync(file, "utf-8");

    // Check for .js imports
    const importMatches = content.match(/from\s+["']\.\/[^"']+["']/g) || [];

    for (const imp of importMatches) {
      if (!imp.includes(".js")) {
        throw new Error(
          `${file}: expected .js extension in import, got: ${imp}`,
        );
      }
      if (imp.includes(".ts")) {
        throw new Error(`${file}: unexpected .ts extension in import: ${imp}`);
      }
    }

    if (importMatches.length === 0 && !file.endsWith("types/index.ts")) {
      throw new Error(`${file}: no relative imports found to verify`);
    }
  }

  console.log("Import extension verification passed: all imports use .js");

  console.log("Success");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
