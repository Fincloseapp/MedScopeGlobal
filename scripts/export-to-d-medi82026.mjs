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
  readFileSync,
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
const LOCAL_ENV_SKIP = new Set(["MEDSCOPE_RUNTIME", "NEXTJS_ENV"]);

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

function parseEnvFile(filePath) {
  if (!filePath || !existsSync(filePath)) return {};
  const out = {};
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = line.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function envFilled(val) {
  if (val == null) return false;
  const v = String(val).trim();
  if (!v) return false;
  if (/^your[-_]/i.test(v)) return false;
  if (/^from https?:/i.test(v)) return false;
  if (v === "generate-a-long-random-string") return false;
  if (v.includes("[PASSWORD]")) return false;
  return true;
}

function mergeEnvMaps(maps) {
  const merged = {};
  for (const map of maps) {
    for (const [key, val] of Object.entries(map || {})) {
      if (LOCAL_ENV_SKIP.has(key)) continue;
      if (envFilled(val)) merged[key] = val;
      else if (!(key in merged)) merged[key] = val;
    }
  }
  return merged;
}

function serializeEnv(map) {
  const keys = Object.keys(map);
  const lines = [
    "# MedScopeGlobal — D:\\Medi82026 local env (do not commit)",
    `# merged ${new Date().toISOString()}`,
    "",
  ];
  for (const key of keys) {
    const val = map[key] == null ? "" : String(map[key]);
    if (/[\s#"=]/.test(val)) {
      lines.push(`${key}="${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}=${val}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function envStatusText(map) {
  const lines = [
    "Nastavení D:\\Medi82026 — pouze názvy klíčů (hodnoty se sem nikdy nepíší).",
    `Vygenerováno: ${new Date().toISOString()}`,
    "",
  ];
  for (const key of Object.keys(map)) {
    lines.push(`${key}\t${envFilled(map[key]) ? "filled" : "empty"}`);
  }
  lines.push("");
  return lines.join("\n");
}

function copyWindowsLaunchers(srcRoot, dest) {
  const dir = join(srcRoot, "scripts", "windows");
  const names = ["env-utils.ps1", "set-roots.ps1", "start-local.ps1", "deploy-from-d.ps1"];
  const copied = [];
  for (const name of names) {
    const from = join(dir, name);
    if (!existsSync(from)) continue;
    copyFileSync(from, join(dest, name));
    copied.push(name);
  }
  return copied;
}

function copyLogoHeaders(srcRoot, dest) {
  const fromDir = join(srcRoot, "public", "assets", "logo");
  const toDir = join(dest, "public", "assets", "logo");
  mkdirSync(toDir, { recursive: true });
  const copied = [];
  for (const name of ["logo-header.png", "logo-header.webp"]) {
    const from = join(fromDir, name);
    if (!existsSync(from)) continue;
    copyFileSync(from, join(toDir, name));
    copied.push(name);
  }
  return copied;
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

const copiedLaunchers = copyWindowsLaunchers(srcRoot, dest);
const copiedLogos = copyLogoHeaders(srcRoot, dest);

const envSources = [
  join(srcRoot, ".env.example"),
  join(srcRoot, ".env.production.local.example"),
  join(srcRoot, ".dev.vars"),
  join(srcRoot, ".env.cloudflare.local"),
  join(srcRoot, ".env.local"),
  "D:\\medscope.local\\.env.local",
  join(srcRoot, "D:\\medscope.local", ".env.local"),
];
const mergedEnv = mergeEnvMaps(envSources.map(parseEnvFile));
mergedEnv.MEDSCOPE_PROJECT_ROOT = "D:\\Medi82026";
mergedEnv.MEDSCOPE_DATA_ROOT = "D:\\Medi82026\\data";
mergedEnv.MEDSCOPE_LOGS_ROOT = "D:\\Medi82026\\logs";
if (!mergedEnv.NEXT_PUBLIC_SITE_URL) mergedEnv.NEXT_PUBLIC_SITE_URL = "https://medscopeglobal.com";
if (!mergedEnv.DEFAULT_SITE_LOCALE) mergedEnv.DEFAULT_SITE_LOCALE = "cs";
if (!mergedEnv.INGESTION_LOCALE) mergedEnv.INGESTION_LOCALE = "cs";
writeFileSync(join(dest, ".env.local"), serializeEnv(mergedEnv), "utf8");
writeFileSync(join(dest, "NASTAVENI-STAV.txt"), envStatusText(mergedEnv), "utf8");
if (!copiedEnv.includes(".env.local")) copiedEnv.push(".env.local");

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
  join(dest, "CTI-ME.md"),
  `# D:\\Medi82026 — dnešní updaty MedScopeGlobal (20. 8. 2026)

Tato složka je **lokální kopie** dnešní práce na https://medscopeglobal.com
Nespoléhá na Cloud Agent. Otevřete ji v Cursoru z disku **D:**.

## Co tu je

- Zdrojový kód větve \`${branch}\` (commit \`${head}\`) včetně git historie
- Sloučené \`.env.local\` + inventura klíčů v \`NASTAVENI-STAV.txt\` (bez hodnot)
- Data a logy v \`data\\\` a \`logs\\\`
- \`set-roots.ps1\`, \`start-local.ps1\`, \`deploy-from-d.ps1\`
- Logo header: ${copiedLogos.join(", ") || "doplňte public/assets/logo/logo-header.webp"}

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

\`start-local.ps1\` sloučí klíče ze starého \`D:\\medscope.local\\.env.local\` do \`.env.local\`.
Vyplněné hodnoty se prázdnou šablonou **nepřepíší**.

## Nasazení na medscopeglobal.com z D:

\`\`\`powershell
powershell -ExecutionPolicy Bypass -File D:\\Medi82026\\deploy-from-d.ps1
\`\`\`

Skript vypne \`CLOUDFLARE_API_TOKEN\` (read-only token vrací 403) a použije Wrangler OAuth.
Jednorázově: \`npx wrangler login\` (účet dawe.zegzul@seznam.cz).

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

## Lokální kořen D:\\Medi82026

- \`npm run dev\` z této složky (nebo \`start-local.ps1\`)
- data \`D:\\Medi82026\\data\`, logy \`D:\\Medi82026\\logs\`
- cesty: pokud existuje \`D:\\Medi82026\\package.json\`, bere se jako projektový kořen
- deploy: \`deploy-from-d.ps1\` (Wrangler OAuth, bez read-only API tokenu)

## Commity dnes

\`\`\`
${todayLog || log}
\`\`\`

## Nastavení zkopírované sem

${copiedEnv.map((n) => `- \`${n}\``).join("\n") || "- jen šablony"}
${copiedLaunchers.map((n) => `- \`${n}\``).join("\n")}

Inventura klíčů (filled/empty, bez hodnot): \`NASTAVENI-STAV.txt\`.
`,
  "utf8"
);

const count = walkCount(dest);
console.log(`Exported ${count} items -> ${dest}`);
console.log(`git ${branch} ${head}`);
console.log(`env copied: ${copiedEnv.join(", ") || "(none)"}`);
console.log(`launchers: ${copiedLaunchers.join(", ") || "(none)"}`);
console.log(`logos: ${copiedLogos.join(", ") || "(none)"}`);

function walkCount(dir) {
  let n = 0;
  for (const name of readdirSync(dir)) {
    n += 1;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) n += walkCount(full);
  }
  return n;
}
