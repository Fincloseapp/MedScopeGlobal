#!/usr/bin/env node
/**
 * Copy today's MedScopeGlobal tree onto D: so work can continue locally
 * without Cloud Agent. On Windows writes D:\Medi82026. In this Linux
 * workspace the same folder name is created next to the repo.
 */
import {
  cpSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  ".open-next",
  ".wrangler",
  "coverage",
  "D:\\medscope.local",
  "D:\\medscope.logs",
  "D:\\Medi82026",
]);

const SKIP_FILE_NAMES = new Set([".DS_Store"]);

function destRoot(srcRoot) {
  if (process.platform === "win32") return "D:\\Medi82026";
  return join(srcRoot, "D:\\Medi82026");
}

function shouldSkip(src, srcRoot, dest) {
  const resolvedSrc = resolve(src);
  const resolvedDest = resolve(dest);
  if (resolvedSrc === resolve(srcRoot)) return false;
  if (resolvedSrc === resolvedDest || resolvedSrc.startsWith(resolvedDest + sep)) return true;
  const rel = relative(srcRoot, src);
  if (rel.startsWith("..")) return true;
  const parts = rel.split(/[/\\]/);
  if (parts.some((p) => SKIP_DIR_NAMES.has(p))) return true;
  if (SKIP_FILE_NAMES.has(basename(src))) return true;
  return false;
}

function git(srcRoot, args) {
  const r = spawnSync("git", args, { cwd: srcRoot, encoding: "utf8" });
  return (r.stdout || r.stderr || "").trim();
}

function copyEnvIfPresent(srcRoot, dest, name) {
  const from = join(srcRoot, name);
  if (!existsSync(from)) return false;
  copyFileSync(from, join(dest, name));
  return true;
}

const srcRoot = resolve(process.cwd());
const dest = destRoot(srcRoot);
if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}

const rsync = spawnSync(
  "rsync",
  [
    "-a",
    "--delete",
    "--exclude",
    "node_modules",
    "--exclude",
    ".next",
    "--exclude",
    ".open-next",
    "--exclude",
    ".wrangler",
    "--exclude",
    "coverage",
    "--exclude",
    "D:\\*",
    srcRoot + "/",
    dest + "/",
  ],
  { encoding: "utf8" }
);

if (rsync.status !== 0) {
  const staging = join("/tmp", "Medi82026-export");
  if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  cpSync(srcRoot, staging, {
    recursive: true,
    filter: (src) => !shouldSkip(src, srcRoot, dest),
  });
  mkdirSync(dest, { recursive: true });
  cpSync(staging, dest, { recursive: true });
  rmSync(staging, { recursive: true, force: true });
} else {
  mkdirSync(dest, { recursive: true });
}

mkdirSync(join(dest, "data"), { recursive: true });
mkdirSync(join(dest, "logs"), { recursive: true });

for (const nested of ["D:\\medscope.local", "D:\\medscope.logs", "D:\\Medi82026"]) {
  const nestedPath = join(dest, nested);
  if (existsSync(nestedPath)) rmSync(nestedPath, { recursive: true, force: true });
}

const copiedEnv = [
  ".env.example",
  ".env.production.local.example",
  ".env.local",
  ".env.cloudflare.local",
  ".dev.vars",
].filter((name) => copyEnvIfPresent(srcRoot, dest, name));

const head = git(srcRoot, ["rev-parse", "--short", "HEAD"]);
const branch = git(srcRoot, ["branch", "--show-current"]);
const log = git(srcRoot, ["log", "-15", "--oneline"]);
const todayLog = git(srcRoot, [
  "log",
  "--since=2026-08-20 00:00",
  "--until=2026-08-21 00:00",
  "--pretty=format:%h %s",
]);

writeFileSync(
  join(dest, "GIT-STAV.txt"),
  [
    `branch: ${branch}`,
    `commit: ${head}`,
    `exported: ${new Date().toISOString()}`,
    "",
    "Dnešní commity:",
    todayLog || log,
    "",
  ].join("\n"),
  "utf8"
);

writeFileSync(
  join(dest, "roots.env"),
  [
    "MEDSCOPE_PROJECT_ROOT=D:\\Medi82026",
    "MEDSCOPE_DATA_ROOT=D:\\Medi82026\\data",
    "MEDSCOPE_LOGS_ROOT=D:\\Medi82026\\logs",
    "NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com",
    "DEFAULT_SITE_LOCALE=cs",
    "INGESTION_LOCALE=cs",
    "",
  ].join("\n"),
  "utf8"
);

writeFileSync(
  join(dest, "set-roots.ps1"),
  `$ErrorActionPreference = "Stop"
$root = "D:\\Medi82026"
if (-not (Test-Path $root)) { throw "Složka $root neexistuje." }
$env:MEDSCOPE_PROJECT_ROOT = $root
$env:MEDSCOPE_DATA_ROOT = Join-Path $root "data"
$env:MEDSCOPE_LOGS_ROOT = Join-Path $root "logs"
Set-Location $root
Write-Host "MedScopeGlobal root = $root"
`,
  "utf8"
);

writeFileSync(
  join(dest, "start-local.ps1"),
  `$ErrorActionPreference = "Stop"
. "$PSScriptRoot\\set-roots.ps1"
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "Nainstalujte Node.js LTS a npm, pak spusťte znovu."
}
if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Host "Instaluji závislosti (jednou)…"
  npm install
}
if (-not (Test-Path (Join-Path $root ".env.local")) -and (Test-Path (Join-Path $root ".env.example"))) {
  Copy-Item (Join-Path $root ".env.example") (Join-Path $root ".env.local")
  Write-Host "Vytvořeno .env.local ze šablony — doplňte klíče ze starého D:\\medscope.local\\.env.local"
}
npm run dev
`,
  "utf8"
);

writeFileSync(
  join(dest, "CTI-ME.md"),
  `# D:\\Medi82026 — dnešní updaty MedScopeGlobal (20. 8. 2026)

Tato složka je **lokální kopie** dnešní práce na https://medscopeglobal.com
Nespoléhá na Cloud Agent. Otevřete ji v Cursoru z disku **D:**.

## Co tu je

- Zdrojový kód větve \`${branch}\` (commit \`${head}\`) včetně git historie
- Dnešní nastavení: ${copiedEnv.join(", ") || "šablony .env.example"}
- Data a logy v \`data\\\` a \`logs\\\`
- Skripty \`set-roots.ps1\` a \`start-local.ps1\`

Není tu \`node_modules\` ani Cloudflare build — na D: je doplníte příkazem \`npm install\`.

## Spuštění na Windows (disk D)

\`\`\`powershell
cd D:\\Medi82026
. .\\set-roots.ps1
npm install
npm run dev
\`\`\`

nebo:

\`\`\`powershell
powershell -ExecutionPolicy Bypass -File D:\\Medi82026\\start-local.ps1
\`\`\`

Doplňte \`.env.local\` (Supabase, Groq, Stripe). Máte-li klíče ve \`D:\\medscope.local\\.env.local\`, zkopírujte je sem.

## Dnešní změny

Soubor \`dnesni-updaty.md\`. Živý web: https://medscopeglobal.com
`,
  "utf8"
);

writeFileSync(
  join(dest, "dnesni-updaty.md"),
  `# Dnešní updaty — 20. 8. 2026

Větev: \`${branch}\`
Commit: \`${head}\`

## Co je na medscopeglobal.com

1. **Články** — pryč GROQ_API_KEY / „pro plné redakční zpracování“, tenké FOI/zprávy se čtou jako přehled ze zdroje. Veřejné české zprávy (KOMPAS, žádost o informace) zůstávají otevřené. Odborné anglické/guidelines a v19/v24 briefy chtějí přihlášení + ČLK.
2. **Doporučený obsah** — české veřejné články, ne anglické guidelines ani reklama MeDiprep uvnitř textu.
3. **MeDiktor na /aplikace** — text na mobilu česky (Klinický zápis, Interní konzultace, Nahrávání…, Zrušit).
4. **Úvodní stránka** — místo věty o cronech je dnešní datum, svátek, případně státní svátek / významný den / den ve zdravotnictví.

## Commity dnes

\`\`\`
${todayLog || log}
\`\`\`

## Nastavení zkopírované sem

${copiedEnv.map((n) => `- \`${n}\``).join("\n") || "- jen šablony"}

Lokální kořeny: \`D:\\Medi82026\`, data \`D:\\Medi82026\\data\`, logy \`D:\\Medi82026\\logs\`.
`,
  "utf8"
);

const count = walkCount(dest);
console.log(`Exported ${count} items -> ${dest}`);
console.log(`git ${branch} ${head}`);
console.log(`env copied: ${copiedEnv.join(", ") || "(none)"}`);

function walkCount(dir) {
  let n = 0;
  for (const name of readdirSync(dir)) {
    n += 1;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) n += walkCount(full);
  }
  return n;
}
