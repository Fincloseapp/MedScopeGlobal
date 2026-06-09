#!/usr/bin/env node
/**
 * Sync MedScopeGlobal logos from D:\MedScopeGlobal\logo → public/assets/logo/
 * Canonical names: Logo_Transparent.png, Logo_Print.png, Logo_Negative.png
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = process.env.MEDSCOPE_LOGO_SOURCE ?? "D:\\MedScopeGlobal\\logo";
const DEST_DIR = join(root, "public", "assets", "logo");

const CANONICAL = [
  {
    dest: "Logo_Transparent.png",
    sources: ["Logo_Transparent.png", "Logo1_1781011732671.jpeg", "Logo1_1781011732671.jpg"],
  },
  {
    dest: "Logo_Print.png",
    sources: ["Logo_Print.png", "Logo2_1781012016912.jpg", "Logo2_1781012016912.jpeg"],
  },
  {
    dest: "Logo_Negative.png",
    sources: ["Logo_Negative.png", "Logo4_1781012021235.jpg", "Logo4_1781012021235.jpeg"],
  },
];

function detectExt(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return ".png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return ".jpg";
  return ".png";
}

mkdirSync(DEST_DIR, { recursive: true });

const resolved = {};

for (const { dest, sources } of CANONICAL) {
  let copied = false;
  for (const src of sources) {
    const srcPath = join(SOURCE_DIR, src);
    if (!existsSync(srcPath)) continue;
    const buf = readFileSync(srcPath);
    const ext = detectExt(buf);
    const finalName = dest.replace(/\.(png|jpg)$/i, "") + ext;
    const destPath = join(DEST_DIR, finalName);
    copyFileSync(srcPath, destPath);
    resolved[dest.replace(/\.(png|jpg)$/i, "").replace("Logo_", "").toLowerCase()] = finalName;
    console.log(`✓ ${src} → public/assets/logo/${finalName}`);
    copied = true;
    break;
  }
  if (!copied) console.warn(`⚠ missing: ${dest} (checked ${sources.join(", ")})`);
}

writeFileSync(
  join(DEST_DIR, "manifest.json"),
  JSON.stringify(
    {
      sourceDir: SOURCE_DIR,
      syncedAt: new Date().toISOString(),
      files: {
        transparent: resolved.transparent ?? "Logo_Transparent.png",
        print: resolved.print ?? "Logo_Print.png",
        negative: resolved.negative ?? "Logo_Negative.png",
      },
    },
    null,
    2
  )
);

writeFileSync(
  join(root, "lib", "brand", "logo-paths.generated.ts"),
  `/** AUTO-GENERATED — scripts/sync-logos-from-d.mjs */\nexport const LOGO_FILES = ${JSON.stringify(
    {
      transparent: resolved.transparent ?? "Logo_Transparent.png",
      print: resolved.print ?? "Logo_Print.png",
      negative: resolved.negative ?? "Logo_Negative.png",
    },
    null,
    2
  )} as const;\n`
);

console.log("Logo sync done.");
