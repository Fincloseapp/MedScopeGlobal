#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const runId = process.argv[2];
const pollSeconds = Number(process.env.POLL_SECONDS || 90);

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
if (!token) {
  console.error("Missing GH_TOKEN / GITHUB_TOKEN");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function getLatestRun() {
  const res = await fetch(
    "https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/workflows/deploy-v17.yml/runs?per_page=1",
    { headers }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`list runs failed: ${res.status}`);
  return data.workflow_runs?.[0] ?? null;
}

async function getRun(id) {
  const res = await fetch(
    `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/runs/${id}`,
    { headers }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`get run failed: ${res.status}`);
  return data;
}

async function getFailedSteps(id) {
  const res = await fetch(
    `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/runs/${id}/jobs`,
    { headers }
  );
  const data = await res.json();
  if (!res.ok) return [];
  const failed = [];
  for (const job of data.jobs ?? []) {
    for (const step of job.steps ?? []) {
      if (step.conclusion === "failure") {
        failed.push({ job: job.name, step: step.name });
      }
    }
  }
  return failed;
}

let targetRunId = runId;

if (!targetRunId) {
  const latest = await getLatestRun();
  if (!latest) throw new Error("no workflow runs found");
  targetRunId = latest.id;
}

const rerunRes = await fetch(
  `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/runs/${targetRunId}/rerun`,
  { method: "POST", headers }
);

if (!rerunRes.ok) {
  const body = await rerunRes.text();
  throw new Error(`rerun failed: ${rerunRes.status} ${body.slice(0, 300)}`);
}

console.log(JSON.stringify({ action: "rerun", sourceRunId: targetRunId }));

const started = Date.now();
let current = null;

while (Date.now() - started < pollSeconds * 1000) {
  await new Promise((r) => setTimeout(r, 15_000));
  const latest = await getLatestRun();
  if (!latest) continue;
  current = await getRun(latest.id);
  console.log(
    JSON.stringify({
      runId: current.id,
      status: current.status,
      conclusion: current.conclusion,
      html_url: current.html_url,
    })
  );
  if (current.status === "completed") break;
}

if (!current) {
  console.error("No run observed after rerun");
  process.exit(1);
}

const failedSteps = current.conclusion === "failure" ? await getFailedSteps(current.id) : [];

console.log(
  JSON.stringify(
    {
      success: current.conclusion === "success",
      runId: current.id,
      status: current.status,
      conclusion: current.conclusion,
      html_url: current.html_url,
      head_sha: current.head_sha,
      failedSteps,
    },
    null,
    2
  )
);

process.exit(current.conclusion === "success" ? 0 : 1);
