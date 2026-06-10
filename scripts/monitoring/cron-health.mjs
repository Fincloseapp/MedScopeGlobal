#!/usr/bin/env node
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { LOGS_ROOT } from "../v24/_paths.mjs";

export function logCronHealth(cronId, status, ms, metrics = {}) {
  const dir = join(LOGS_ROOT, "cron");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${new Date().toISOString().slice(0, 10)}.log`);
  appendFileSync(file, `[${new Date().toISOString()}] ${cronId} ${status} ${ms}ms ${JSON.stringify(metrics)}\n`);
}
