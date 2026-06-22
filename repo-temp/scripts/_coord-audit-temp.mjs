#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = {};
  for (const f of [".env.local", ".env"]) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const env = loadEnv();
const token = env.VERCEL_TOKEN;
const ghToken = env.GITHUB_TOKEN || env.GH_TOKEN;
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const base = "https://medscopeglobal.com";

async function ghMain() {
  if (!ghToken) return { error: "NO_GITHUB_TOKEN" };
  const res = await fetch("https://api.github.com/repos/Fincloseapp/MedScopeGlobal/commits/main", {
    headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) return { error: `HTTP ${res.status}` };
  const j = await res.json();
  return { sha: j.sha, short: j.sha?.slice(0, 7), message: j.commit?.message?.split("\n")[0] };
}

async function vercelProd() {
  if (!token) return { error: "NO_VERCEL_TOKEN" };
  const qs = new URLSearchParams({ teamId, projectId, limit: "10", target: "production" });
  const res = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const deps = data.deployments ?? [];
  const prod = deps.find((d) => d.target === "production") ?? deps[0];
  if (!prod) return { error: "NO_DEPLOYMENTS" };
  return {
    state: prod.readyState ?? prod.state,
    sha: prod.meta?.githubCommitSha,
    short: (prod.meta?.githubCommitSha ?? "").slice(0, 7),
    url: prod.url,
    created: prod.createdAt ?? prod.created,
    all: deps.slice(0, 5).map((d) => ({
      state: d.readyState ?? d.state,
      short: (d.meta?.githubCommitSha ?? "").slice(0, 7),
      target: d.target,
    })),
  };
}

async function smoke(name, fn) {
  try {
    const r = await fn();
    return { name, ...r };
  } catch (e) {
    return { name, ok: false, detail: e instanceof Error ? e.message : "error" };
  }
}

const checks = [];

checks.push(
  await smoke("github-main", async () => {
    const g = await ghMain();
    return { ok: !g.error, detail: g.error ?? `${g.short} ${g.message}` };
  })
);

checks.push(
  await smoke("vercel-prod", async () => {
    const v = await vercelProd();
    return { ok: !v.error && v.state === "READY", detail: v.error ?? `${v.state} ${v.short}` };
  })
);

const endpoints = [
  ["POST /api/tts", async () => {
    const res = await fetch(`${base}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "MedScope coordination audit." }),
      signal: AbortSignal.timeout(45000),
    });
    const ct = res.headers.get("content-type") ?? "";
    return { ok: res.ok && ct.includes("audio"), detail: `${res.status} ${ct.slice(0, 40)}` };
  }],
  ["GET /api/v38/health", async () => {
    const res = await fetch(`${base}/api/v38/health`, { signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  }],
  ["GET /api/v41/health", async () => {
    const res = await fetch(`${base}/api/v41/health`, { signal: AbortSignal.timeout(20000) });
    const j = await res.json().catch(() => ({}));
    return { ok: res.ok, detail: `model=${j?.tts?.model} openai=${j?.tts?.openaiValid}` };
  }],
  ["GET /api/v42/health", async () => {
    const res = await fetch(`${base}/api/v42/health`, { signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  }],
  ["GET /api/v43/health", async () => {
    const res = await fetch(`${base}/api/v43/health`, { signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  }],
  ["GET /api/v44/health", async () => {
    const res = await fetch(`${base}/api/v44/health`, { signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  }],
  ["GET /api/v45/health", async () => {
    const res = await fetch(`${base}/api/v45/health`, { signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  }],
  ["GET /api/v46/health", async () => {
    const res = await fetch(`${base}/api/v46/health`, { signal: AbortSignal.timeout(20000) });
    const j = await res.json().catch(() => ({}));
    const tts = j?.subsystems?.tts ?? j?.tts ?? {};
    return { ok: res.ok, detail: JSON.stringify(tts).slice(0, 120) };
  }],
  ["GET /api/video/stream", async () => {
    const res = await fetch(`${base}/api/video/stream`, { signal: AbortSignal.timeout(15000) });
    return { ok: res.status === 400, detail: `HTTP ${res.status}` };
  }],
  ["GET /academy", async () => {
    const res = await fetch(`${base}/academy`, { signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  }],
  ["GET /checkout", async () => {
    const res = await fetch(`${base}/checkout`, { signal: AbortSignal.timeout(20000), redirect: "manual" });
    return { ok: res.status >= 200 && res.status < 400, detail: `HTTP ${res.status}` };
  }],
  ["GET / (v0)", async () => {
    const res = await fetch(`${base}/`, { signal: AbortSignal.timeout(20000) });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  }],
];

for (const [name, fn] of endpoints) {
  checks.push(await smoke(name, fn));
}

const gh = await ghMain();
const vercel = await vercelProd();

console.log(JSON.stringify({ github: gh, vercel, checks }, null, 2));
