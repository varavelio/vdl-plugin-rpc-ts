import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { beforeAll, describe, it } from "vitest";

const repoRoot = resolve(__dirname, "..");
const fixturesDir = resolve(__dirname, "fixtures");
const localVdlBin = resolve(repoRoot, "node_modules/.bin/vdl");
const localTscBin = resolve(repoRoot, "node_modules/.bin/tsc");

const tscArgs = [
  "--noEmit",
  "--moduleResolution",
  "bundler",
  "--module",
  "esnext",
  "--target",
  "es6",
  "--lib",
  "es6,dom,dom.iterable",
  "--types",
  "node",
  "--skipLibCheck",
  "--allowImportingTsExtensions",
];

const fixtures = listFixtures(fixturesDir);

describe("E2E: VDL RPC TS", () => {
  beforeAll(() => {
    runCommand("npm", ["run", "build"], repoRoot, "pipe");
  });

  it.each(fixtures)("builds fixture: %s", (fixtureName) => {
    const fixturePath = join(fixturesDir, fixtureName);

    // Each fixture runs through the full flow: generate -> typecheck -> runtime.
    cleanGeneratedOutput(fixturePath);
    runFixtureGeneration(fixturePath);
    runFixtureTypeCheck(fixturePath);
    runFixtureRuntime(fixturePath);
  });
});

function listFixtures(rootDir: string): string[] {
  // A directory participates in E2E only if it has its own VDL config file.
  return readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(rootDir, name, "vdl.config.vdl")))
    .sort();
}

function cleanGeneratedOutput(fixturePath: string): void {
  const generatedRoot = join(fixturePath, "gen");

  if (existsSync(generatedRoot)) {
    rmSync(generatedRoot, { recursive: true, force: true });
  }
}

function runFixtureGeneration(fixturePath: string): void {
  runCommand(localVdlBin, ["generate"], fixturePath, "pipe");
}

function runFixtureTypeCheck(fixturePath: string): void {
  const filesToTypeCheck = getFixtureTypeScriptInputs(fixturePath);

  if (filesToTypeCheck.length === 0) {
    return;
  }

  runCommand(
    localTscBin,
    [...filesToTypeCheck, ...tscArgs],
    fixturePath,
    "pipe",
  );
}

function runFixtureRuntime(fixturePath: string): void {
  runCommand("node", ["main.ts"], fixturePath, "inherit");
}

function getFixtureTypeScriptInputs(fixturePath: string): string[] {
  // We pass explicit inputs to tsc so each fixture is validated in isolation.
  const topLevelTypeScriptFiles = readdirSync(fixturePath, {
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => `./${entry.name}`)
    .sort();

  const generatedTypeScriptFiles = collectTypeScriptFiles(
    join(fixturePath, "gen"),
    fixturePath,
  );

  return [...topLevelTypeScriptFiles, ...generatedTypeScriptFiles];
}

function collectTypeScriptFiles(
  rootDir: string,
  fixturePath: string,
): string[] {
  if (!existsSync(rootDir)) {
    return [];
  }

  const files: string[] = [];
  const pendingDirs = [rootDir];

  while (pendingDirs.length > 0) {
    const currentDir = pendingDirs.pop();

    if (!currentDir) {
      continue;
    }

    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const absolutePath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        pendingDirs.push(absolutePath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".ts")) {
        files.push(`./${relative(fixturePath, absolutePath)}`);
      }
    }
  }

  return files.sort();
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  stdio: "inherit" | "pipe",
): void {
  execFileSync(command, args, { cwd, stdio });
}
