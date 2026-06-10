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

const v24Orchestrator = join(root, "lib/v24/orchestrator.ts");
const v24Hub = join(root, "components/v24/ai-medical-hub.tsx");
if (!existsSync(v24Orchestrator)) fail("lib/v24/orchestrator.ts missing");
else pass("v24 orchestrator");
if (!existsSync(v24Hub)) fail("components/v24/ai-medical-hub.tsx missing");
else pass("v24 AI Medical hub");

const v25Orchestrator = join(root, "lib/v25/orchestrator.ts");
const v25Admin = join(root, "app/(admin)/admin/system/page.tsx");
const v25Link = join(root, "lib/v25/linktest/link-checker.mjs");
const v25ImageTest = join(root, "lib/v25/images/image-test.ts");
const v25ImageAdmin = join(root, "app/(admin)/admin/images/page.tsx");
if (!existsSync(v25Orchestrator)) fail("lib/v25/orchestrator.ts missing");
else pass("v25.1 orchestrator");
if (!existsSync(v25Admin)) fail("admin/system dashboard missing");
else pass("v25.1 admin system dashboard");
if (!existsSync(v25Link)) fail("lib/v25/linktest/link-checker.mjs missing");
else pass("v25.1 link checker");
if (!existsSync(v25ImageTest)) fail("lib/v25/images/image-test.ts missing");
else pass("v25.1 image test");
if (!existsSync(v25ImageAdmin)) fail("admin/images dashboard missing");
else pass("v25.1 admin image center");

if (!ok) process.exit(1);
console.log("\nBuild version verification PASSED");
