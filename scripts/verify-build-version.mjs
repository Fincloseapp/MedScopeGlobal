#!/usr/bin/env node
/**
 * Static build-time checks — version stamp + logo presets (no production HTTP).
 * Post-deploy smoke: node scripts/verify-v23.3.2.mjs (or latest verify-v*.mjs)
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let ok = true;

function fail(msg) {
  console.error(`✗ ${msg}`);
  ok = false;
}

function pass(msg) {
  console.log(`✓ ${msg}`);
}

const versionPath = join(root, "lib/v20/version.ts");
if (!existsSync(versionPath)) {
  fail("lib/v20/version.ts missing");
  process.exit(1);
}

const versionSrc = readFileSync(versionPath, "utf8");
const versionMatch = versionSrc.match(/V20_UI_VERSION\s*=\s*"([^"]+)"/);
const stampMatch = versionSrc.match(/V20_UI_BUILD_STAMP\s*=\s*"([^"]+)"/);

if (!versionMatch) {
  fail("V20_UI_VERSION not found in lib/v20/version.ts");
} else {
  pass(`UI version: ${versionMatch[1]}`);
}

if (!stampMatch) {
  fail("V20_UI_BUILD_STAMP not found");
} else {
  pass(`Build stamp: ${stampMatch[1]}`);
}

const presetsPath = join(root, "lib/brand/logo-presets.ts");
if (!existsSync(presetsPath)) {
  fail("logo-presets.ts missing");
} else {
  const presets = readFileSync(presetsPath, "utf8");
  for (const key of ["newsletter-hero", "newsletter-footer", "header"]) {
    if (!presets.includes(`"${key}"`)) fail(`logo preset missing: ${key}`);
    else pass(`logo preset: ${key}`);
  }
}

const heroPath = join(root, "components/newsletter/Hero.tsx");
const footerPath = join(root, "components/newsletter/Footer.tsx");
if (!existsSync(heroPath)) fail("components/newsletter/Hero.tsx missing");
else pass("newsletter Hero component");
if (!existsSync(footerPath)) fail("components/newsletter/Footer.tsx missing");
else pass("newsletter Footer component");

if (!ok) process.exit(1);
console.log("\nBuild version verification PASSED");
