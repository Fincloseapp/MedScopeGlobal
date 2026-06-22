#!/usr/bin/env node
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { MEDSCOPE_LOGS_ROOT as LOGS_ROOT } from "../../lib/config/paths.mjs";

export function logError(source, message) {
  const dir = join(LOGS_ROOT, "errors");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, `${new Date().toISOString().slice(0, 10)}.log`), `[${source}] ${message}\n`);
}
