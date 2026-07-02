#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sha = process.argv[2] || process.env.COMMIT_SHA;
const pollSeconds = Number(process.env.POLL_SECONDS || 0);

function loadToken() {
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      let value = m[2].trim().replace(/^["']|["']$/g, "");
      if (key === "GH_TOKEN" || key === "GITHUB_TOKEN") return value;
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

const wfRes = await fetch(
  "https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/workflows/deploy-v17.yml/runs?per_page=5",
  { headers }
);
const wfData = await wfRes.json();
if (!wfRes.ok) {
  console.error("Workflow API error:", wfRes.status, JSON.stringify(wfData).slice(0, 400));
  process.exit(1);
}

let runs = wfData.workflow_runs ?? [];
let match =
  (sha && runs.find((r) => r.head_sha === sha)) ||
  runs[0];

if (pollSeconds > 0 && sha) {
  const started = Date.now();
  while (Date.now() - started < pollSeconds * 1000) {
    if (match && match.status === "completed") break;
    await new Promise((r) => setTimeout(r, 20_000));
    const again = await fetch(
      "https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/workflows/deploy-v17.yml/runs?per_page=5",
      { headers }
    );
    const againData = await again.json();
    runs = againData.workflow_runs ?? [];
    match = runs.find((r) => r.head_sha === sha) || runs[0];
    console.error(
      JSON.stringify({
        polling: true,
        runId: match?.id,
        status: match?.status,
        conclusion: match?.conclusion,
      })
    );
  }
}

let commitMessage = null;
if (sha) {
  const commitRes = await fetch(
    `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/commits/${sha}`,
    { headers }
  );
  if (commitRes.ok) {
    const commitData = await commitRes.json();
    commitMessage = commitData.commit?.message ?? null;
  }
}

console.log(
  JSON.stringify(
    {
      commit: sha ?? match?.head_sha ?? null,
      commitMessage,
      workflow: "deploy-v17.yml",
      triggered: Boolean(match),
      latestRun: match
        ? {
            id: match.id,
            status: match.status,
            conclusion: match.conclusion,
            created_at: match.created_at,
            html_url: match.html_url,
            head_sha: match.head_sha,
            event: match.event,
          }
        : null,
      recentRuns: runs.slice(0, 3).map((r) => ({
        id: r.id,
        status: r.status,
        conclusion: r.conclusion,
        head_sha: r.head_sha?.slice(0, 12),
        created_at: r.created_at,
      })),
    },
    null,
    2
  )
);

if (!match) process.exit(1);

process.exitCode = match.conclusion === "success" ? 0 : 1;

const runId = match.id;
const jobsRes = await fetch(
  `https://api.github.com/repos/Fincloseapp/MedScopeGlobal/actions/runs/${runId}/jobs`,
  { headers }
);
if (jobsRes.ok) {
  const jobsData = await jobsRes.json();
  const failedSteps = [];
  for (const job of jobsData.jobs ?? []) {
    for (const step of job.steps ?? []) {
      if (step.conclusion === "failure") {
        failedSteps.push({ job: job.name, step: step.name, conclusion: step.conclusion });
      }
    }
  }
  if (failedSteps.length) {
    console.log(JSON.stringify({ failedSteps }, null, 2));
  }
}
