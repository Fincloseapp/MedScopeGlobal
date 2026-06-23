#!/usr/bin/env node
/**
 * Sync a secret from .env.local to GitHub Actions.
 * Usage: node scripts/sync-github-secret.mjs CRON_SECRET
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import https from "node:https";
import { createRequire } from "node:module";
import { projectPath } from "../lib/config/paths.mjs";

const root = projectPath();
const secretName = process.argv[2];
const owner = "Fincloseapp";
const repo = "MedScopeGlobal";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function ensureSodium() {
  const dir = projectPath(".deploy-tmp", "gh-secrets");
  mkdirSync(dir, { recursive: true });
  const files = {
    "tweetnacl.js": "https://unpkg.com/tweetnacl@1.0.3/nacl-fast.min.js",
    "blake2b.js": "https://unpkg.com/blakejs@1.2.1/blake2b.js",
    "util.js": "https://unpkg.com/blakejs@1.2.1/util.js",
    "tweetsodium.js": "https://unpkg.com/tweetsodium@0.0.3/dist/index.umd.js",
  };
  for (const [name, url] of Object.entries(files)) {
    const path = join(dir, name);
    if (!existsSync(path) || readFileSync(path, "utf8").length < 10) {
      writeFileSync(path, await httpsGet(url), "utf8");
    }
  }
  const pkgDir = join(dir, "node_modules");
  mkdirSync(join(pkgDir, "tweetnacl"), { recursive: true });
  mkdirSync(join(pkgDir, "blakejs"), { recursive: true });
  mkdirSync(join(pkgDir, "tweetsodium"), { recursive: true });
  writeFileSync(join(pkgDir, "tweetnacl", "package.json"), '{"name":"tweetnacl","main":"index.js"}');
  writeFileSync(join(pkgDir, "blakejs", "package.json"), '{"name":"blakejs","main":"index.js"}');
  writeFileSync(join(pkgDir, "tweetsodium", "package.json"), '{"name":"tweetsodium","main":"index.js"}');
  writeFileSync(join(pkgDir, "tweetnacl", "index.js"), readFileSync(join(dir, "tweetnacl.js"), "utf8"));
  writeFileSync(join(pkgDir, "blakejs", "index.js"), [
    readFileSync(join(dir, "blake2b.js"), "utf8"),
    "module.exports = require('./blake2b');",
  ].join("\n"));
  writeFileSync(join(pkgDir, "blakejs", "blake2b.js"), readFileSync(join(dir, "blake2b.js"), "utf8"));
  writeFileSync(join(pkgDir, "blakejs", "util.js"), readFileSync(join(dir, "util.js"), "utf8"));
  writeFileSync(join(pkgDir, "tweetsodium", "index.js"), readFileSync(join(dir, "tweetsodium.js"), "utf8"));
  return createRequire(join(pkgDir, "tweetnacl", "package.json"));
}

function loadEnv() {
  const env = {};
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

if (!secretName) {
  console.error("Usage: node scripts/sync-github-secret.mjs <SECRET_NAME>");
  process.exit(1);
}

const fileEnv = loadEnv();
const value = process.env[secretName] || fileEnv[secretName];
const token =
  process.env.GH_TOKEN ||
  process.env.GITHUB_TOKEN ||
  fileEnv.GH_TOKEN ||
  fileEnv.GITHUB_TOKEN;

if (!value) {
  console.error(`Missing value for ${secretName}`);
  process.exit(1);
}
if (!token) {
  console.error("Missing GH_TOKEN / GITHUB_TOKEN");
  process.exit(1);
}

const require = await ensureSodium();
const sodiumDir = join(root, ".deploy-tmp", "gh-secrets", "node_modules");
const sodium = require(join(sodiumDir, "tweetsodium", "index.js"));

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

const keyRes = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`,
  { headers }
);
const keyData = await keyRes.json();
if (!keyRes.ok) {
  console.error("public-key failed:", keyRes.status, JSON.stringify(keyData));
  process.exit(1);
}

const encryptedBytes = sodium.seal(Buffer.from(value, "utf8"), Buffer.from(keyData.key, "base64"));
const encrypted_value = Buffer.from(encryptedBytes).toString("base64");

const putRes = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secretName}`,
  {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ encrypted_value, key_id: keyData.key_id }),
  }
);

if (!putRes.ok) {
  const body = await putRes.text();
  console.error("secret put failed:", putRes.status, body.slice(0, 300));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, secret: secretName }));
