#!/usr/bin/env node
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { MEDSCOPE_LOGS_ROOT as LOGS_ROOT } from "../../lib/config/paths.mjs";

export function logContentHealth(section, qaScore, published) {
  const dir = join(LOGS_ROOT, "content-health");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, `${new Date().toISOString().slice(0, 10)}.log`), `${section} qa=${qaScore} pub=${published}\n`);
}
