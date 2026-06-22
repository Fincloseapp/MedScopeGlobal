#!/usr/bin/env node
/**
 * Nasazení UX patch na Fincloseapp/MedScopeGlobal (main) → Vercel auto-deploy.
 *
 * Použití (PowerShell, po vytvoření PAT na https://github.com/settings/tokens ):
 *   $env:GITHUB_TOKEN = "github_pat_..."
 *   node scripts/deploy-production.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patchDir = join(root, "github-production");
const owner = "Fincloseapp";
const repo = "MedScopeGlobal";
const branch = "main";
const commitMessage =
  "feat: česká UX — laik/lékař/vědec, medicína, navigace, sitemap";

const TOKEN_KEYS = ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT"];

function loadToken() {
  for (const key of TOKEN_KEYS) {
    if (process.env[key]) return process.env[key].trim();
  }
  for (const envFile of [
    join(root, ".env.local"),
    join(root, ".env"),
    "D:\\MedScopeGlobal\\.env.local"
  ]) {
    if (!existsSync(envFile)) continue;
    const text = readFileSync(envFile, "utf8");
    for (const key of TOKEN_KEYS) {
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

async function gh(token, path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${data.message ?? text.slice(0, 200)}`);
  }
  return data;
}

async function verifyProduction(token) {
  const res = await fetch("https://www.medscopeglobal.com/", {
    headers: { "User-Agent": "MedScopeGlobal-Deploy/1.0" }
  });
  const html = await res.text();
  const ok =
    html.includes("Laik a student") ||
    html.includes("Odborný medicínský magazín pro každého");
  return { status: res.status, deployed: ok };
}

async function main() {
  const token = loadToken();
  if (!token) {
    writeFileSync(
      join(root, "NASADENI.md"),
      `# Nasazení na medscopeglobal.com

1. Otevřete https://github.com/settings/tokens?type=beta
2. Vytvořte token s oprávněním **Contents: Read and write** pro repo \`Fincloseapp/MedScopeGlobal\`
3. V PowerShellu:

\`\`\`powershell
cd C:\\Users\\zegzulka\\MedScopeGlobal
$env:GITHUB_TOKEN = "VÁŠ_TOKEN"
node scripts/deploy-production.mjs
\`\`\`

Vercel nasadí produkci do ~2 minut.
`,
      "utf8"
    );
    throw new Error(
      "Chybí GITHUB_TOKEN. Viz NASADENI.md — vytvořte PAT a spusťte znovu."
    );
  }

  if (!existsSync(patchDir)) {
    throw new Error("Chybí složka github-production/");
  }

  const patchFiles = walk(patchDir).map((abs) => ({
    abs,
    repoPath: relative(patchDir, abs).replace(/\\/g, "/")
  }));

  console.log(`Nahrávám ${patchFiles.length} souborů na ${owner}/${repo}@${branch}…`);

  const ref = await gh(token, `/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  const parentSha = ref.object.sha;
  const parentCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${parentSha}`);
  const baseTreeSha = parentCommit.tree.sha;

  const treeItems = [];
  for (const { abs, repoPath } of patchFiles) {
    const buf = readFileSync(abs);
    const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      body: {
        content: buf.toString("base64"),
        encoding: "base64"
      }
    });
    treeItems.push({ path: repoPath, mode: "100644", type: "blob", sha: blob.sha });
    console.log("  +", repoPath);
  }

  const tree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: { base_tree: baseTreeSha, tree: treeItems }
  });

  const commit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: { message: commitMessage, tree: tree.sha, parents: [parentSha] }
  });

  await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: { sha: commit.sha }
  });

  console.log("\nCommit:", commit.html_url ?? commit.sha);
  console.log("Čekám na Vercel build…");

  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 15_000));
    const check = await verifyProduction(token);
    console.log(`  pokus ${i + 1}: HTTP ${check.status}, nový obsah: ${check.deployed ? "ANO" : "ne"}`);
    if (check.deployed) {
      console.log("\nHotovo: https://www.medscopeglobal.com");
      return;
    }
  }

  console.log("\nCommit je na GitHubu; Vercel může ještě buildit. Zkontrolujte dashboard.");
}

main().catch((err) => {
  console.error("\nChyba:", err.message || err);
  process.exit(1);
});
