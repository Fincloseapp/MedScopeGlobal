#!/usr/bin/env node
/**
 * Zkopíruje vybrané soubory z github-production/ do klonu a pushne na main.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patchDir = join(root, "github-production");
const cloneDir = join(root, ".deploy-clone");
const repo = "https://github.com/Fincloseapp/MedScopeGlobal.git";

const patchRoots = ["src", "tests"];

function run(cmd, cwd = root) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: process.env });
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function copyPatchIntoClone() {
  for (const sub of patchRoots) {
    const from = join(patchDir, sub);
    if (!existsSync(from)) continue;
    for (const file of walk(from)) {
      const rel = relative(patchDir, file);
      const dest = join(cloneDir, rel);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(file, dest);
      console.log("patch:", rel);
    }
  }
}

if (!existsSync(patchDir)) {
  console.error("Chybí složka github-production/");
  process.exit(1);
}

if (existsSync(cloneDir)) rmSync(cloneDir, { recursive: true, force: true });
mkdirSync(cloneDir, { recursive: true });

run(`git clone --depth 1 ${repo} .`, cloneDir);
copyPatchIntoClone();
run("git add -A", cloneDir);
run("git status", cloneDir);

const msg =
  "UX: česká navigace, profily laik/lékař/vědec, medicína, oprava sitemap";

try {
  run(`git commit -m "${msg}"`, cloneDir);
} catch {
  console.log("Commit selhal — možná žádné změny nebo chybí git identita.");
  process.exit(1);
}

run("git push origin main", cloneDir);
console.log("\nPush dokončen. Vercel nasadí https://medscopeglobal.com");
