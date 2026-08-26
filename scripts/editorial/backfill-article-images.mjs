#!/usr/bin/env node
/**
 * Backfill hero images for published articles missing cover_image_url.
 * Dry-run by default — pass --apply to write via service role.
 *
 * Usage:
 *   node scripts/editorial/backfill-article-images.mjs
 *   node scripts/editorial/backfill-article-images.mjs --apply
 *   node scripts/editorial/backfill-article-images.mjs --limit=20 --apply
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);

const result = spawnSync(
  "pnpm",
  ["exec", "tsx", "scripts/editorial/backfill-article-images-runner.ts", ...args],
  { cwd: root, stdio: "inherit", env: process.env }
);

process.exit(result.status === null ? 1 : result.status);
