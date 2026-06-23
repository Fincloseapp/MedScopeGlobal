#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsc = join(root, "node_modules/typescript/bin/tsc");

if (!existsSync(tsc)) {
  console.error("MISSING_TSC:", tsc);
  process.exit(2);
}

const r = spawnSync(process.execPath, [tsc, "--noEmit", "--pretty", "false"], {
  cwd: root,
  encoding: "utf8",
});
process.stdout.write(r.stdout ?? "");
process.stderr.write(r.stderr ?? "");
process.exit(r.status ?? 1);
