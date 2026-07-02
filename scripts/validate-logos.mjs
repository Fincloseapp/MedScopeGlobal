#!/usr/bin/env node
/**
 * Validate logo pipeline integrity before deploy (v23.2.3)
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoDir = join(root, "public", "assets", "logo");
const generatedPath = join(root, "lib", "brand", "logo-paths.generated.ts");

const MAX_WEBP = 500 * 1024;
let ok = true;

function fail(msg) {
  console.error(`✗ ${msg}`);
  ok = false;
}

function pass(msg) {
  console.log(`✓ ${msg}`);
}

if (!existsSync(generatedPath)) {
  fail("logo-paths.generated.ts missing — run: node scripts/sync-logos.mjs");
  process.exit(1);
}

const src = readFileSync(generatedPath, "utf8");
if (!src.includes("LOGO_WEBP") || !src.includes("LOGO_RETINA")) {
  fail("logo-paths.generated.ts missing LOGO_WEBP / LOGO_RETINA exports");
}

const required = [
  "Logo_Transparent.png",
  "Logo_Print.jpg",
  "Logo_Negative.jpg",
  "Logo_Transparent.webp",
  "Logo_Print.webp",
  "Logo_Negative.webp",
  "Logo_Transparent@2x.png",
  "Logo_Transparent@2x.webp",
  "Logo_Print@2x.png",
  "Logo_Print@2x.webp",
  "Logo_Negative@2x.png",
  "Logo_Negative@2x.webp",
  "manifest.json",
];

for (const file of required) {
  const p = join(logoDir, file);
  if (!existsSync(p)) {
    fail(`missing: public/assets/logo/${file}`);
    continue;
  }
  pass(`exists: ${file}`);
  if (file.endsWith(".webp")) {
    const size = statSync(p).size;
    if (size > MAX_WEBP) fail(`${file} exceeds 500 KB (${size} bytes)`);
    else pass(`${file} size OK (${Math.round(size / 1024)} KB)`);
  }
}

if (!existsSync(join(root, "lib", "brand", "logo.ts"))) fail("lib/brand/logo.ts missing");
else pass("lib/brand/logo.ts");

if (!existsSync(join(root, "components", "brand", "medscope-logo.tsx"))) {
  fail("components/brand/medscope-logo.tsx missing");
} else pass("medscope-logo.tsx");

if (!ok) {
  console.error("\nLogo validation FAILED — run: node scripts/sync-logos.mjs\n");
  process.exit(1);
}

console.log("\nLogo validation PASSED (v23.2.3)\n");
