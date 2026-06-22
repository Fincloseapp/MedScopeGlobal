#!/usr/bin/env node
/** Deploy bez git/npm — MinGit + GitHub API fallback */
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patchDir = join(root, "github-production");
const tools = join(root, ".tools");
const mingitZip = join(tools, "MinGit.zip");
const mingitRoot = join(tools, "mingit");
const cloneDir = join(tools, "MedScopeGlobal");
const owner = "Fincloseapp";
const repo = "MedScopeGlobal";
const commitMessage =
  "feat: česká UX — laik/lékař/vědec, medicína, navigace, sitemap";

function log(msg) {
  console.log(msg);
}

function findGit() {
  const candidates = [
    process.env.GIT_EXE,
    join(mingitRoot, "cmd", "git.exe"),
    join(mingitRoot, "mingw64", "bin", "git.exe"),
    "C:\\Program Files\\Git\\cmd\\git.exe",
    "C:\\Program Files\\Git\\bin\\git.exe"
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  const ghDesktop = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "GitHubDesktop")
    : null;
  if (ghDesktop && existsSync(ghDesktop)) {
    try {
      const apps = readdirSync(ghDesktop).filter((n) => n.startsWith("app-"));
      for (const app of apps) {
        const g = join(ghDesktop, app, "resources", "app", "git", "cmd", "git.exe");
        if (existsSync(g)) return g;
      }
    } catch {
      /* ignore */
    }
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
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GCM_INTERACTIVE: "never"
    }
  });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")}:\n${r.stderr || r.stdout}`);
  }
  return (r.stdout || "").trim();
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function applyPatch() {
  for (const abs of walk(patchDir)) {
    const rel = relative(patchDir, abs);
    const dest = join(cloneDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(abs, dest);
    log("  patch " + rel.replace(/\\/g, "/"));
  }
}

function loadToken() {
  for (const key of ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT"]) {
    if (process.env[key]) return process.env[key].trim();
  }
  for (const f of [
    join(root, ".env.local"),
    join(root, ".env"),
    "D:\\MedScopeGlobal\\.env.local"
  ]) {
    if (!existsSync(f)) continue;
    const t = readFileSync(f, "utf8");
    for (const key of ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT", "VERCEL_TOKEN"]) {
      const m = t.match(new RegExp(`^${key}=(.+)$`, "m"));
      if (m && key.startsWith("GITHUB")) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

async function pushViaApi(token) {
  const patchFiles = walk(patchDir).map((abs) => ({
    abs,
    repoPath: relative(patchDir, abs).replace(/\\/g, "/")
  }));

  async function gh(path, opts = {}) {
    const res = await fetch(`https://api.github.com${path}`, {
      method: opts.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(opts.body ? { "Content-Type": "application/json" } : {})
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${opts.method || "GET"} ${path}: ${data.message || res.status}`);
    return data;
  }

  const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/main`);
  const parentSha = ref.object.sha;
  const parentCommit = await gh(`/repos/${owner}/${repo}/git/commits/${parentSha}`);
  const treeItems = [];
  for (const { abs, repoPath } of patchFiles) {
    const buf = readFileSync(abs);
    const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      body: { content: buf.toString("base64"), encoding: "base64" }
    });
    treeItems.push({ path: repoPath, mode: "100644", type: "blob", sha: blob.sha });
    log("  api " + repoPath);
  }
  const tree = await gh(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: { base_tree: parentCommit.tree.sha, tree: treeItems }
  });
  const commit = await gh(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: { message: commitMessage, tree: tree.sha, parents: [parentSha] }
  });
  await gh(`/repos/${owner}/${repo}/git/refs/heads/main`, {
    method: "PATCH",
    body: { sha: commit.sha }
  });
  return commit.sha;
}

async function pushViaGit(git, token) {
  if (existsSync(cloneDir)) rmSync(cloneDir, { recursive: true, force: true });
  mkdirSync(cloneDir, { recursive: true });
  const url = token
    ? `https://x-access-token:${token}@github.com/${owner}/${repo}.git`
    : `https://github.com/${owner}/${repo}.git`;
  runGit(git, ["clone", "--depth", "1", url, "."], cloneDir);
  applyPatch();
  runGit(git, ["config", "user.email", "deploy@medscopeglobal.com"], cloneDir);
  runGit(git, ["config", "user.name", "MedScopeGlobal Deploy"], cloneDir);
  runGit(git, ["add", "-A"], cloneDir);
  const status = runGit(git, ["status", "--porcelain"], cloneDir);
  if (!status) {
    log("Žádné změny — produkční patch už může být nasazený.");
    return null;
  }
  runGit(git, ["commit", "-m", commitMessage], cloneDir);
  runGit(git, ["push", "origin", "main"], cloneDir);
  return runGit(git, ["rev-parse", "HEAD"], cloneDir);
}

async function main() {
  if (!existsSync(patchDir)) throw new Error("Chybí github-production/");
  const token = loadToken();
  let sha = null;

  if (token) {
    log("Push přes GitHub API…");
    sha = await pushViaApi(token);
  } else {
    log("Token nenalezen — zkouším Git s uloženými credentials…");
    const git = await ensureMinGit();
    log("Git: " + git);
    sha = await pushViaGit(git, null);
  }

  if (sha) log("Commit: " + sha);
  log("Vercel nasadí https://medscopeglobal.com za 1–3 minuty.");
}

main().catch((e) => {
  console.error("Deploy selhal:", e.message);
  process.exit(1);
});
