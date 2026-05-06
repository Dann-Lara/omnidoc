#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const devDir = path.join(projectRoot, ".next", "dev");
const turbopackCacheDir = path.join(devDir, "cache", "turbopack");

const defaultMaxMb = 1536;
const forceByArg = process.argv.includes("--force");
const maxArg = process.argv.find((arg) => arg.startsWith("--max-mb="));
const parsedMaxFromArg = maxArg ? Number.parseInt(maxArg.split("=")[1], 10) : Number.NaN;
const parsedMaxMb = Number.parseInt(process.env.NEXT_DEV_CACHE_MAX_MB ?? "", 10);
const maxMb =
  Number.isFinite(parsedMaxFromArg) && parsedMaxFromArg > 0
    ? parsedMaxFromArg
    : Number.isFinite(parsedMaxMb) && parsedMaxMb > 0
      ? parsedMaxMb
      : defaultMaxMb;
const maxBytes = maxMb * 1024 * 1024;
const forceClean = forceByArg || process.env.NEXT_DEV_CLEAN_FORCE === "1";

function getDirSizeBytes(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  let total = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const stat = fs.lstatSync(fullPath);

    if (entry.isDirectory()) {
      total += getDirSizeBytes(fullPath);
      continue;
    }

    total += stat.size;
  }

  return total;
}

if (!fs.existsSync(devDir)) {
  process.exit(0);
}

const measuredPath = fs.existsSync(turbopackCacheDir) ? turbopackCacheDir : devDir;
const currentBytes = getDirSizeBytes(measuredPath);

if (!forceClean && currentBytes <= maxBytes) {
  process.exit(0);
}

fs.rmSync(devDir, { recursive: true, force: true });

const sizeMb = Math.round((currentBytes / (1024 * 1024)) * 10) / 10;
const reason = forceClean ? "forced" : `threshold>${maxMb}MB`;
console.log(`[cache-clean] Removed .next/dev (${sizeMb}MB from ${path.relative(projectRoot, measuredPath)}), reason: ${reason}.`);
