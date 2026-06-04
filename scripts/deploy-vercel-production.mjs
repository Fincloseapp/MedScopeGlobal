#!/usr/bin/env node
/**
 * Full production deploy: Supabase migrations → GitHub push → Vercel production.
 * Uses only Node.js (no npm required).
 *
 * Requires in D:\medscopeglobal\.env.local (at least one):
 *   GITHUB_TOKEN — push to Fincloseapp/MedScopeGlobal (triggers Vercel)
 *   VERCEL_TOKEN — optional redeploy hook (+ VERCEL_PROJECT_ID from .vercel/project.json)
 */
import {
  copyFileSync,
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tools = join(root, ".tools");
const mingitZip = join(tools, "MinGit.zip");
const mingitRoot = join(tools, "mingit");
const cloneDir = join(
  process.env.TEMP || tools,
  `msg-deploy-${Date.now()}`
);
const owner = "Fincloseapp";
const repo = "MedScopeGlobal";
const branch = "main";
const commitMessage =
  process.env.DEPLOY_COMMIT_MESSAGE ??
  "feat(v5plus): evidence-based AI — citations, DOI, PubMed, regulatory, evidence scoring";

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".tools",
  ".vercel",
  "terminals",
]);
const SKIP_FILES = new Set([
  ".env.local",
  ".env.local.bak",
  ".env.vercel.pull",
  "tsconfig.tsbuildinfo",
]);

function log(msg) {
  console.log(msg);
}

function loadEnvFile(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function loadEnv() {
  return {
    ...loadEnvFile(join(root, ".env.local")),
    ...loadEnvFile(join(root, ".env")),
    ...(process.env.GITHUB_TOKEN ? { GITHUB_TOKEN: process.env.GITHUB_TOKEN } : {}),
    ...(process.env.VERCEL_ORG_ID ? { VERCEL_ORG_ID: process.env.VERCEL_ORG_ID } : {}),
    ...(process.env.VERCEL_PROJECT_ID ? { VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID } : {}),
    ...(process.env.VERCEL_TOKEN ? { VERCEL_TOKEN: process.env.VERCEL_TOKEN } : {}),
  };
}

function findGit() {
  const candidates = [
    process.env.GIT_EXE,
    join(mingitRoot, "cmd", "git.exe"),
    join(mingitRoot, "mingw64", "bin", "git.exe"),
    "C:\\Program Files\\Git\\cmd\\git.exe",
    "C:\\Program Files\\Git\\bin\\git.exe",
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function download(url, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download ${url}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function ensureMinGit() {
  let git = findGit();
  if (git) return git;
  log("Stahuji portable Git…");
  mkdirSync(tools, { recursive: true });
  await download(
    "https://github.com/git-for-windows/git/releases/download/v2.54.0.windows.1/MinGit-2.54.0-64-bit.zip",
    mingitZip
  );
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -Path '${mingitZip.replace(/'/g, "''")}' -DestinationPath '${mingitRoot.replace(/'/g, "''")}' -Force"`,
    { stdio: "inherit" }
  );
  git = findGit();
  if (!git) {
    const nested = join(mingitRoot, "MinGit-2.54.0-64-bit", "cmd", "git.exe");
    if (existsSync(nested)) return nested;
  }
  if (!git) throw new Error("MinGit se nepodařilo rozbalit");
  return git;
}

function runGit(git, args, cwd) {
  const r = spawnSync(git, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never" },
  });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")}\n${r.stderr || r.stdout}`);
  }
  return (r.stdout || "").trim();
}

function walkProject(dir, files = [], base = dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(base, full);
    if (SKIP_DIRS.has(name)) continue;
    if (statSync(full).isDirectory()) {
      walkProject(full, files, base);
    } else if (!SKIP_FILES.has(name)) {
      files.push({ abs: full, rel: rel.replace(/\\/g, "/") });
    }
  }
  return files;
}

async function applyMigrations() {
  log("\n=== 1/3 Supabase migrace ===");
  const r = spawnSync(process.execPath, [join(root, "scripts", "apply-migrations.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (r.status !== 0) {
    log("Varování: migrace selhala nebo částečně — pokračuji deployem.");
  }
}

async function syncVercelEnv(env) {
  const token = env.VERCEL_TOKEN;
  const projectId =
    env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
  const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";

  if (!token) {
    log("\n=== 2/3 Vercel env sync — přeskočeno (chybí VERCEL_TOKEN) ===");
    return;
  }

  log("\n=== 2/3 Vercel env sync ===");
  const keys = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "CRON_SECRET",
    "GROQ_API_KEY",
    "GROQ_MODEL_PRIMARY",
    "GROQ_MODEL_FALLBACK",
    "GROQ_MODEL_FALLBACK_2",
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "ADMIN_NOTIFY_EMAIL",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "INGESTION_LOCALE",
    "DEFAULT_SITE_LOCALE",
  ];

  for (const key of keys) {
    const value = env[key];
    if (!value) {
      log(`  ○ skip ${key}`);
      continue;
    }
    const qs = teamId ? `?teamId=${teamId}` : "";
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/env${qs}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value,
          type: key.includes("SECRET") || key.includes("KEY") && !key.startsWith("NEXT_PUBLIC_") ? "encrypted" : "plain",
          target: ["production", "preview"],
        }),
      }
    );
    if (res.ok) log(`  ✓ ${key}`);
    else {
      const err = await res.text();
      if (err.includes("already exists") || res.status === 409) {
        log(`  ~ ${key} (exists)`);
      } else {
        log(`  ✗ ${key}: ${res.status}`);
      }
    }
  }
}

async function pushToGitHub(token) {
  log("\n=== 3/3 GitHub push → Vercel auto-deploy ===");
  const git = await ensureMinGit();
  log(`Git: ${git}`);

  // D: drive / portable Git — avoid "dubious ownership"
  runGit(git, ["config", "--global", "--add", "safe.directory", "*"], root);

  if (existsSync(cloneDir)) {
    try {
      rmSync(cloneDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
    } catch {
      /* use fresh timestamped dir — cloneDir already unique */
    }
  }

  const url = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
  const cloneParent = dirname(cloneDir);
  const cloneName = basename(cloneDir);
  runGit(
    git,
    ["clone", "--depth", "1", "-b", branch, url, cloneName],
    cloneParent
  );

  if (!existsSync(join(cloneDir, ".git"))) {
    throw new Error("Git clone failed — .git missing in " + cloneDir);
  }

  const projectFiles = walkProject(root);
  log(`Kopíruji ${projectFiles.length} souborů do repozitáře…`);
  for (const { abs, rel } of projectFiles) {
    const dest = join(cloneDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(abs, dest);
  }

  /** Legacy repo paths not in D:\\medscopeglobal — must delete or Vercel build fails */
  const legacyRemove = [
    "src",
    "prisma",
    "next.config.ts",
    "prisma.config.ts",
    "instrumentation.ts",
    "sentry.client.config.ts",
    "sentry.server.config.ts",
    "e2e",
    "playwright.config.ts",
    "vitest.config.ts",
    "vitest.setup.ts",
    "eslint.config.mjs",
  ];
  for (const rel of legacyRemove) {
    const p = join(cloneDir, rel);
    if (existsSync(p)) {
      rmSync(p, { recursive: true, force: true });
      log(`  removed legacy ${rel}`);
    }
  }

  runGit(git, ["config", "user.email", "deploy@medscopeglobal.com"], cloneDir);
  runGit(git, ["config", "user.name", "MedScopeGlobal Deploy"], cloneDir);
  runGit(git, ["add", "-A"], cloneDir);

  const status = runGit(git, ["status", "--porcelain"], cloneDir);
  if (!status) {
    log("Žádné změny k pushnutí.");
    return null;
  }

  runGit(git, ["commit", "-m", commitMessage], cloneDir);
  runGit(git, ["push", "origin", branch], cloneDir);
  const sha = runGit(git, ["rev-parse", "HEAD"], cloneDir);

  try {
    rmSync(cloneDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 300 });
  } catch {
    log(`(cleanup skipped: ${cloneDir})`);
  }

  return sha;
}

async function triggerVercelDeploy(env) {
  const token = env.VERCEL_TOKEN;
  const projectId =
    env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
  const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;

  if (!token) return;

  log("\n=== Vercel redeploy trigger ===");
  const qs = teamId ? `?teamId=${teamId}` : "";
  const res = await fetch(`https://api.vercel.com/v13/deployments${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "medscopeglobal",
      project: projectId,
      target: "production",
      gitSource: env.GITHUB_REPO_ID
        ? { type: "github", repoId: env.GITHUB_REPO_ID, ref: branch }
        : undefined,
    }),
  });
  const text = await res.text();
  if (res.ok) {
    const data = JSON.parse(text);
    log(`Deployment: ${data.url || data.id}`);
    if (data.inspectorUrl) log(`Inspector: ${data.inspectorUrl}`);
  } else {
    log(`Vercel API: ${res.status} — GitHub push stačí pro auto-deploy.`);
  }
}

async function verifySite() {
  log("\nČekám na Vercel build (90 s)…");
  await new Promise((r) => setTimeout(r, 90_000));
  try {
    const res = await fetch("https://www.medscopeglobal.com/vop", {
      headers: { "User-Agent": "MedScopeGlobal-Deploy/1.0" },
    });
    const html = await res.text();
    const ok = res.ok && (html.includes("obchodní podmínky") || html.includes("VOP"));
    log(`HTTP ${res.status} /vop — ${ok ? "OK (V4a live)" : "ještě nebo starý build"}`);
    log("URL: https://www.medscopeglobal.com");
  } catch (e) {
    log(`Kontrola webu selhala: ${e.message}`);
  }
}

async function main() {
  log("=== MedScopeGlobal V4a → Vercel Production ===");
  const env = loadEnv();

  await applyMigrations();
  await syncVercelEnv(env);

  const ghToken =
    env.GITHUB_TOKEN || env.GH_TOKEN || env.GITHUB_PAT || process.env.GITHUB_TOKEN;

  if (!ghToken) {
    throw new Error(
      "Chybí GITHUB_TOKEN v .env.local. Vytvořte PAT na https://github.com/settings/tokens (scope: repo Contents write) a spusťte znovu: node scripts/deploy-vercel-production.mjs"
    );
  }

  const sha = await pushToGitHub(ghToken);
  if (sha) log(`Commit: ${sha}`);

  await triggerVercelDeploy(env);
  await verifySite();

  log("\n=== Hotovo ===");
}

main().catch((e) => {
  console.error("\nDeploy selhal:", e.message || e);
  process.exit(1);
});
