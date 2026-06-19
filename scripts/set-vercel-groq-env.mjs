#!/usr/bin/env node
/** Set GROQ_API_KEY (+ AI_MODEL) on Vercel via REST API */
import fs from "node:fs";
import { projectPath } from "../lib/config/paths.mjs";

const envPath = projectPath(".env.local");

function loadEnv() {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function upsertEnv(token, projectId, teamId, key, value, target = "production") {
  const url = `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}`;
  const list = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await list.json();
  const existing = (data.envs ?? []).find((e) => e.key === key && e.target?.includes(target));

  if (existing) {
    const patch = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}?teamId=${teamId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ value, target: [target] }),
    });
    if (!patch.ok) throw new Error(`PATCH ${key}: ${await patch.text()}`);
    return "updated";
  }

  const create = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ key, value, type: "encrypted", target: [target] }),
  });
  if (!create.ok) throw new Error(`POST ${key}: ${await create.text()}`);
  return "created";
}

const env = loadEnv();
const token = env.VERCEL_TOKEN?.trim();
const projectId = env.VERCEL_PROJECT_ID?.trim() ?? "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const teamId = env.VERCEL_ORG_ID?.trim() ?? "team_m1FSjvKjWV9Wgm1WhEycgHqJ";

if (!token) {
  console.error("VERCEL_TOKEN missing");
  process.exit(1);
}

const toSet = {
  GROQ_API_KEY: env.GROQ_API_KEY,
  AI_MODEL_PROVIDER: env.AI_MODEL_PROVIDER ?? "groq",
  AI_MODEL: env.AI_MODEL ?? "llama-3.1-70b-versatile",
};

for (const [key, value] of Object.entries(toSet)) {
  if (!value?.trim()) {
    console.log(`skip ${key} (empty in .env.local)`);
    continue;
  }
  const action = await upsertEnv(token, projectId, teamId, key, value.trim());
  console.log(`${key}: ${action}`);
}

console.log("Done.");
