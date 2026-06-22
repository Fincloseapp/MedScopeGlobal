#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const runId = process.argv[2];

function loadToken() {
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      if (key !== "GH_TOKEN" && key !== "GITHUB_TOKEN") continue;
      return m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN || null;
}

const token = loadToken();
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

const jobsRes = await fetch(
  `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/runs/${runId}/jobs`,
  { headers }
);
const jobs = (await jobsRes.json()).jobs ?? [];
const job = jobs[0];
if (!job) {
  console.error("no jobs");
  process.exit(1);
}

const logRes = await fetch(
  `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/jobs/${job.id}/logs`,
  { headers, redirect: "follow" }
);
const text = await logRes.text();
const lines = text.split(/\r?\n/);
const hits = lines.filter(
  (l) =>
    /error|Error|FAIL|fail|✗|CRON|secret|verify/i.test(l) &&
    !/##\[group\]|##\[endgroup\]|shell:|env:/i.test(l)
);
console.log(hits.slice(-40).join("\n"));
