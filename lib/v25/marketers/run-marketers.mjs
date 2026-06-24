#!/usr/bin/env node
/**
 * v25.2 — CLI runner pro AI marketery + koordinátora
 *
 * Usage: node lib/v25/marketers/run-marketers.mjs [--skip-coordinator] [--force-report]
 */
import { appendLog } from "../shared.mjs";
import { runPublicMarketer } from "./marketer-public.mjs";
import { runStudentMarketer } from "./marketer-students.mjs";
import { runProMarketer } from "./marketer-pro.mjs";
import { runMarketingCoordinator } from "./marketing-coordinator.mjs";

const args = new Set(process.argv.slice(2));
const skipCoordinator = args.has("--skip-coordinator");
const forceReport = args.has("--force-report");

async function main() {
  appendLog("v25-marketers.log", "run-marketers CLI start");

  const results = {
    public: await runPublicMarketer(),
    students: await runStudentMarketer(),
    pro: await runProMarketer(),
  };

  let coordination = null;
  if (!skipCoordinator) {
    coordination = await runMarketingCoordinator({ forceReport });
  }

  const summary = {
    ok: true,
    marketers: results,
    coordination,
  };

  console.log(JSON.stringify(summary, null, 2));
  appendLog("v25-marketers.log", `run-marketers CLI done: ${JSON.stringify(summary)}`);
  return summary;
}

main().catch((e) => {
  console.error(e);
  appendLog("v25-marketers.log", `run-marketers fatal: ${e.message}`);
  process.exit(1);
});
