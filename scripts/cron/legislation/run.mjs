#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "../_run-section.mjs"), "legislation"], { stdio: "inherit" });
