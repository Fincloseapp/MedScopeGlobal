#!/usr/bin/env node
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { LOGS_ROOT } from "../v24/_paths.mjs";

export function alert(level, message) {
  const dir = join(LOGS_ROOT, "alerts");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, `${new Date().toISOString().slice(0, 10)}.log`), `[${level}] ${message}\n`);
  console.error(`ALERT [${level}] ${message}`);
}
