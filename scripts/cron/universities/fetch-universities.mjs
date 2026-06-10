#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const provider = join(dirname(fileURLToPath(import.meta.url)), "../../../lib/v25/providers/universities-provider.mjs");
const result = spawnSync(process.execPath, [provider], { stdio: "inherit" });
process.exit(result.status ?? 1);
