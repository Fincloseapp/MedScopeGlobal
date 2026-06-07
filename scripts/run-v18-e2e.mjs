#!/usr/bin/env node
/**
 * Run V18 end-to-end API tests.
 * V18_TEST_BASE_URL defaults to https://www.medscopeglobal.com
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsx = join(root, "node_modules/tsx/dist/cli.mjs");
const spec = join(root, "tests/v18/test-v18.spec.ts");

if (!existsSync(tsx)) {
  console.error("✗ tsx missing — run pnpm install");
  process.exit(1);
}

const result = spawnSync(process.execPath, [tsx, spec], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
