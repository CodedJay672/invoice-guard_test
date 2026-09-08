import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const roots = ["apps", "packages"];
const forbidden = [/\.d\.ts$/, /\.d\.ts\.map$/, /\.js$/, /\.js\.map$/];
const ignoredDirectories = new Set(["dist", "node_modules", ".next", ".turbo"]);
const approvedDeclarations = new Set(["apps/api/src/express.d.ts"]);
const findings = [];

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) await scan(entryPath);
      continue;
    }

    const normalized = entryPath.replaceAll("\\", "/");
    if (
      normalized.includes("/src/") &&
      !approvedDeclarations.has(normalized) &&
      forbidden.some((pattern) => pattern.test(entry.name))
    ) {
      findings.push(normalized);
    }
  }
}

for (const root of roots) await scan(root);

if (findings.length > 0) {
  console.error("Generated artifacts are not allowed in source directories:");
  for (const finding of findings.sort()) console.error(`  ${finding}`);
  process.exitCode = 1;
}
