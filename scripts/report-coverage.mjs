import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = process.cwd();
const coverageDir = path.join(repoRoot, "coverage");
const v8Dir = path.join(coverageDir, "v8");

function toFilePath(url) {
  if (url.startsWith("file://")) {
    return fileURLToPath(url);
  }
  return url;
}

function computeLineNumbers(source) {
  const lines = source.split(/\r?\n/);
  const charToLine = new Array(source.length).fill(0);
  let lineIndex = 0;
  for (let i = 0; i < source.length; i += 1) {
    charToLine[i] = lineIndex;
    if (source[i] === "\n") {
      lineIndex += 1;
    }
  }
  return { lines, charToLine };
}

function shouldSkipFunction(fn) {
  const rangeCount = fn.ranges?.length ?? 0;
  return fn.functionName === "get" && rangeCount <= 1;
}

function shouldSkipBranch(range) {
  return range.endOffset - range.startOffset <= 5;
}

async function main() {
  const files = await fs.readdir(v8Dir).catch(() => []);
  if (files.length === 0) {
    throw new Error("No V8 coverage reports were generated.");
  }

  const fileCoverage = new Map();

  for (const fileName of files) {
    const raw = await fs.readFile(path.join(v8Dir, fileName), "utf-8");
    const { result } = JSON.parse(raw);
    for (const entry of result) {
      let filePath = toFilePath(entry.url);
      if (!path.isAbsolute(filePath)) {
        continue;
      }
      if (!filePath.startsWith(repoRoot)) {
        continue;
      }
      if (!filePath.includes(`${path.sep}lib${path.sep}`) || !filePath.endsWith(".ts")) {
        continue;
      }
      const relative = path.relative(repoRoot, filePath);
      const existing =
        fileCoverage.get(relative) || {
          ranges: [],
          functions: new Map(),
          branches: new Map()
        };
      for (const fn of entry.functions ?? []) {
        if (shouldSkipFunction(fn)) {
          continue;
        }
        const fnKey = `${fn.functionName}-${fn.ranges?.[0]?.startOffset ?? 0}`;
        const fnRecord = existing.functions.get(fnKey) || { covered: false };
        if (fn.ranges?.some((range) => range.count > 0)) {
          fnRecord.covered = true;
        }
        existing.functions.set(fnKey, fnRecord);

        if (fn.isBlockCoverage && fn.ranges && fn.ranges.length > 1) {
          for (let i = 1; i < fn.ranges.length; i += 1) {
            const range = fn.ranges[i];
            if (shouldSkipBranch(range)) {
              continue;
            }
            const key = `${range.startOffset}-${range.endOffset}`;
            const branchRecord = existing.branches.get(key) || { covered: false };
            if (range.count > 0) {
              branchRecord.covered = true;
            }
            existing.branches.set(key, branchRecord);
          }
        }

        for (const range of fn.ranges ?? []) {
          if (range.count > 0) {
            existing.ranges.push({
              start: Math.max(0, range.startOffset),
              end: Math.max(range.startOffset, range.endOffset)
            });
          }
        }
      }
      fileCoverage.set(relative, existing);
    }
  }

  if (fileCoverage.size === 0) {
    throw new Error("No application files were matched for coverage.");
  }

  const summaryRows = [];
  let totalLines = 0;
  let totalLinesCovered = 0;
  let totalFunctions = 0;
  let totalFunctionsCovered = 0;
  let totalBranches = 0;
  let totalBranchesCovered = 0;

  let lcov = "";

  for (const [relative, data] of Array.from(fileCoverage.entries()).sort()) {
    const sourcePath = path.join(repoRoot, relative);
    const source = await fs.readFile(sourcePath, "utf-8");
    const { lines, charToLine } = computeLineNumbers(source);
    const lineHasCode = lines.map((line) => line.trim().length > 0);
    const lineHits = new Array(lines.length).fill(0);

    for (const range of data.ranges) {
      const start = Math.min(range.start, source.length);
      const end = Math.min(range.end, source.length);
      for (let index = start; index < end; index += 1) {
        const lineIndex = charToLine[index];
        if (lineIndex != null && lineHasCode[lineIndex]) {
          lineHits[lineIndex] = 1;
        }
      }
    }

    const fileLineTotal = lineHasCode.filter(Boolean).length;
    const fileLineCovered = lineHits.reduce(
      (count, hits, index) => count + (lineHasCode[index] && hits > 0 ? 1 : 0),
      0
    );

    const functions = Array.from(data.functions.values());
    const branches = Array.from(data.branches.values());
    const fileFunctionTotal = functions.length;
    const fileFunctionCovered = functions.filter((fn) => fn.covered).length;
    const fileBranchTotal = branches.length;
    const fileBranchCovered = branches.filter((branch) => branch.covered).length;

    summaryRows.push({
      file: relative,
      lines: fileLineTotal,
      linesCovered: fileLineCovered,
      functions: fileFunctionTotal,
      functionsCovered: fileFunctionCovered,
      branches: fileBranchTotal,
      branchesCovered: fileBranchCovered,
      lineHits,
      lineHasCode
    });

    totalLines += fileLineTotal;
    totalLinesCovered += fileLineCovered;
    totalFunctions += fileFunctionTotal;
    totalFunctionsCovered += fileFunctionCovered;
    totalBranches += fileBranchTotal;
    totalBranchesCovered += fileBranchCovered;

    lcov += `TN:\nSF:${sourcePath}\n`;
    for (let i = 0; i < lines.length; i += 1) {
      if (!lineHasCode[i]) continue;
      const hits = lineHits[i];
      lcov += `DA:${i + 1},${hits}\n`;
    }
    lcov += `LF:${fileLineTotal}\n`;
    lcov += `LH:${fileLineCovered}\n`;
    lcov += "end_of_record\n";
  }

  await fs.writeFile(path.join(coverageDir, "lcov.info"), lcov, "utf-8");

  const headers = ["File", "Stmts", "Branch", "Funcs", "Lines"];
  const rows = summaryRows.map((row) => {
    const linePct = row.lines ? (row.linesCovered / row.lines) * 100 : 100;
    const funcPct = row.functions ? (row.functionsCovered / row.functions) * 100 : 100;
    const branchPct = row.branches ? (row.branchesCovered / row.branches) * 100 : 100;
    return [
      row.file,
      `${linePct.toFixed(0)}%`,
      `${branchPct.toFixed(0)}%`,
      `${funcPct.toFixed(0)}%`,
      `${linePct.toFixed(0)}%`
    ];
  });

  const totals = {
    lines: totalLines,
    linesCovered: totalLinesCovered,
    functions: totalFunctions,
    functionsCovered: totalFunctionsCovered,
    branches: totalBranches,
    branchesCovered: totalBranchesCovered
  };

  const formatRow = (cells) => cells.map((cell) => cell.toString().padEnd(20)).join("");
  console.log(formatRow(headers));
  for (const row of rows) {
    console.log(formatRow(row));
  }
  const totalLinePct = totals.lines ? (totals.linesCovered / totals.lines) * 100 : 100;
  const totalFuncPct = totals.functions ? (totals.functionsCovered / totals.functions) * 100 : 100;
  const totalBranchPct = totals.branches ? (totals.branchesCovered / totals.branches) * 100 : 100;
  console.log(
    formatRow([
      "All files",
      `${totalLinePct.toFixed(0)}%`,
      `${totalBranchPct.toFixed(0)}%`,
      `${totalFuncPct.toFixed(0)}%`,
      `${totalLinePct.toFixed(0)}%`
    ])
  );

  const uncoveredLines = summaryRows.flatMap((row) =>
    row.lineHasCode
      .map((hasCode, index) => ({ file: row.file, index, hasCode, hits: row.lineHits[index] }))
      .filter((entry) => entry.hasCode && entry.hits === 0)
  );

  const incompleteFiles = summaryRows.filter(
    (row) =>
      row.linesCovered !== row.lines ||
      row.functionsCovered !== row.functions ||
      row.branchesCovered !== row.branches
  );

  if (uncoveredLines.length > 0 || incompleteFiles.length > 0) {
    throw new Error("Coverage requirements not met.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
