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
  "feat(v17): activate auto-deploy pipeline with GitHub Actions, Vercel deploy, rollback, and monitoring";

process.env.COMMIT_ONLY = "1";
process.env.DEPLOY_COMMIT_MESSAGE = message;

const result = spawnSync(process.execPath, [join(root, "scripts/deploy-vercel-production.mjs")], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
