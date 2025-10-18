#!/usr/bin/env node
import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const ignoreDirs = new Set([
  ".git",
  "node_modules",
  "coverage",
  ".next",
  "dist",
  "out",
  "tmp"
]);
const binaryExts = new Set([
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".mp3",
  ".mp4",
  ".pdf",
  ".zip"
]);

const languageStats = new Map();
const filesIndexed = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    const relative = path.relative(repoRoot, entryPath);
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      await walk(entryPath);
    } else {
      filesIndexed.push(relative);
      const ext = path.extname(entry.name).toLowerCase();
      if (binaryExts.has(ext)) continue;
      try {
        const contents = await readFile(entryPath, "utf8");
        const lines = contents.split(/\r?\n/).length;
        const current = languageStats.get(ext || "(no ext)") || { files: 0, lines: 0 };
        current.files += 1;
        current.lines += lines;
        languageStats.set(ext || "(no ext)", current);
      } catch {
        // ignore unreadable files
      }
    }
  }
}

async function detectPackageManagers() {
  const managers = [];
  try {
    await stat(path.join(repoRoot, "package-lock.json"));
    managers.push({ tool: "npm", file: "package-lock.json" });
  } catch {}
  try {
    await stat(path.join(repoRoot, "pnpm-lock.yaml"));
    managers.push({ tool: "pnpm", file: "pnpm-lock.yaml" });
  } catch {}
  try {
    await stat(path.join(repoRoot, "yarn.lock"));
    managers.push({ tool: "yarn", file: "yarn.lock" });
  } catch {}
  return managers;
}

async function main() {
  const topLevel = await readdir(repoRoot, { withFileTypes: true });
  const directories = topLevel
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();

  await walk(repoRoot);

  const entryPoints = [];
  for (const candidate of [
    "app/page.tsx",
    "app/create/page.tsx",
    "app/reader/[bookId]/page.tsx"
  ]) {
    try {
      await stat(path.join(repoRoot, candidate));
      entryPoints.push(candidate);
    } catch {}
  }

  const inventory = {
    repoRoot,
    directories,
    packageManagers: await detectPackageManagers(),
    entryPoints,
    languageStats: Array.from(languageStats.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    totalFiles: filesIndexed.length,
    docs: {
      ARCHITECTURE: ["# Architecture Overview", "## System Context", "## Data & Control Flow"].join("\n"),
      RATIONALE: ["# Architecture Rationale", "## Key Decisions"].join("\n"),
      LANGUAGE_EVAL: ["# Language & Stack Evaluation", "## Summary"].join("\n"),
      PERFORMANCE: ["# Performance Review", "## Hotspots"].join("\n"),
      BUILD: ["# Build & Run Guide", "## Commands"].join("\n"),
      OUTPUTS: ["# Expected Outputs", "## Verification"].join("\n")
    }
  };

  console.log(JSON.stringify(inventory, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
