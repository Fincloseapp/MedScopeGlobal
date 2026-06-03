/**
 * Deploy via Vercel API when CLI is unavailable.
 * Requires in .env.local: VERCEL_TOKEN, VERCEL_PROJECT_ID, optional VERCEL_TEAM_ID
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

function loadEnv() {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const token = env.VERCEL_TOKEN || process.env.VERCEL_TOKEN;
const projectId = env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_ID;
const team = env.VERCEL_TEAM_ID ? `?teamId=${env.VERCEL_TEAM_ID}` : "";

if (!token || !projectId) {
  console.error("Missing VERCEL_TOKEN or VERCEL_PROJECT_ID in .env.local");
  process.exit(1);
}

const res = await fetch(`https://api.vercel.com/v13/deployments${team}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: projectId,
    project: projectId,
    target: "production",
    gitSource: {
      type: "github",
      repoId: env.GITHUB_REPO_ID,
      ref: "main",
    },
  }),
});

const text = await res.text();
if (!res.ok) {
  console.error("Vercel API error:", res.status, text);
  console.log("\nFallback: run scripts/auto-deploy.ps1 locally");
  process.exit(1);
}

const data = JSON.parse(text);
console.log("Deployment triggered:", data.url || data.id);
console.log("Inspector:", data.inspectorUrl || "(see Vercel dashboard)");
