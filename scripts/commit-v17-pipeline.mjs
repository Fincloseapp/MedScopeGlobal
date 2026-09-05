#!/usr/bin/env node
/**
 * Prepare a GitHub commit for the V17 auto-deploy pipeline (no push).
 * Requires GH_TOKEN or GITHUB_TOKEN in .env.local (scopes: repo + workflow).
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const message =
  process.env.COMMIT_MESSAGE ??
  "feat(v17): activate auto-deploy pipeline with GitHub Actions and Cloudflare Workers";

const result = spawnSync("git", ["commit", "-am", message], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
