#!/usr/bin/env node
/**
 * Jeden commit na main přes GitHub Git Data API (bez git CLI).
 * Nastavte: $env:GITHUB_TOKEN = "ghp_..."
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patchDir = join(root, "github-production");
const owner = "Fincloseapp";
const repo = "MedScopeGlobal";
const branch = "main";
const commitMessage =
  "UX: česká navigace, profily laik/lékař/vědec, medicína, oprava sitemap";

function loadToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  for (const envFile of [".env.local", ".env"]) {
    const p = join(root, envFile);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, "utf8");
    for (const key of ["GITHUB_TOKEN", "GH_TOKEN"]) {
      const m = text.match(new RegExp(`^${key}=(.+)$`, "m"));
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

async function gh(path, { method = "GET", body } = {}) {
  const token = loadToken();
  if (!token) {
    throw new Error(
      "Chybí GITHUB_TOKEN. V PowerShellu: $env:GITHUB_TOKEN='ghp_...'; node scripts/push-github-api.mjs"
    );
  }
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${data.message ?? JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  const patchFiles = walk(patchDir).map((abs) => ({
    abs,
    repoPath: relative(patchDir, abs).replace(/\\/g, "/")
  }));

  const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  const parentSha = ref.object.sha;
  const parentCommit = await gh(`/repos/${owner}/${repo}/git/commits/${parentSha}`);
  const baseTreeSha = parentCommit.tree.sha;

  const treeItems = [];
  for (const { abs, repoPath } of patchFiles) {
    const content = readFileSync(abs);
    const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      body: { content: content.toString("base64"), encoding: "base64" }
    });
    treeItems.push({
      path: repoPath,
      mode: "100644",
      type: "blob",
      sha: blob.sha
    });
    console.log("blob:", repoPath);
  }

  const tree = await gh(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: { base_tree: baseTreeSha, tree: treeItems }
  });

  const commit = await gh(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: {
      message: commitMessage,
      tree: tree.sha,
      parents: [parentSha]
    }
  });

  await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: { sha: commit.sha, force: false }
  });

  console.log("\nCommit:", commit.sha);
  console.log("Vercel nasadí produkci během několika minut.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
