import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const coverageDir = path.join(repoRoot, "coverage");
const v8Dir = path.join(coverageDir, "v8");

async function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  await rm(coverageDir, { recursive: true, force: true });
  await mkdir(v8Dir, { recursive: true });

  const vitestBin = process.platform === "win32"
    ? path.join("node_modules", ".bin", "vitest.cmd")
    : path.join("node_modules", ".bin", "vitest");

  await run(vitestBin, ["run"], {
    env: {
      ...process.env,
      NODE_V8_COVERAGE: v8Dir
    }
  });

  const nodeArgs = [path.join("scripts", "report-coverage.mjs")];
  await run(process.execPath, nodeArgs, { stdio: "inherit" });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
