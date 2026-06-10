#!/usr/bin/env node
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { LOGS_ROOT } from "../v24/_paths.mjs";

export function logContentHealth(section, qaScore, published) {
  const dir = join(LOGS_ROOT, "content-health");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, `${new Date().toISOString().slice(0, 10)}.log`), `${section} qa=${qaScore} pub=${published}\n`);
}
