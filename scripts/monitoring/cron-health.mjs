#!/usr/bin/env node
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { MEDSCOPE_LOGS_ROOT as LOGS_ROOT } from "../../lib/config/paths.mjs";

export function logCronHealth(cronId, status, ms, metrics = {}) {
  const dir = join(LOGS_ROOT, "cron");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${new Date().toISOString().slice(0, 10)}.log`);
  appendFileSync(file, `[${new Date().toISOString()}] ${cronId} ${status} ${ms}ms ${JSON.stringify(metrics)}\n`);
}
