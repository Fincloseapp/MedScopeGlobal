#!/usr/bin/env node

/**
 * Validate environment variables for MedScopeGlobal production deployment.
 * Run: node scripts/validate-production-env.mjs
 * Never prints secret values — presence only.
 */

import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import { loadProjectEnv } from "./load-env.mjs";
import { validateCronSecret } from "./verify-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadProjectEnv(root);
for (const [key, value] of Object.entries(env)) {
  if (!process.env[key]) process.env[key] = value;
}

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "CRON_SECRET",
];

const translationVars = [
  "GROQ_API_KEY",
  "OPENAI_API_KEY",
  "OPEN_API_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_TRANSLATE_KEY",
];

const recommendedVars = [
  "INGESTION_LOCALE",
  "DEFAULT_SITE_LOCALE",
  "ADMIN_NOTIFY_EMAIL",
];

const stripeVars = [
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
];

console.log("\n📋 MedScopeGlobal Production Environment Validation\n");

const errors = [];
const warnings = [];
let success = true;

function isSet(key) {
  return Boolean(env[key]?.trim() || process.env[key]?.trim());
}

console.log("🔴 REQUIRED:");
for (const key of requiredVars) {
  if (!isSet(key)) {
    console.log(`  ✗ ${key}`);
    errors.push(key);
    success = false;
  } else {
    console.log(`  ✓ ${key}`);
  }
}

const cronCheck = validateCronSecret(env);
if (!cronCheck.ok) {
  console.log(`  ✗ ${cronCheck.reason}`);
  if (!errors.includes("CRON_SECRET")) errors.push("CRON_SECRET");
  success = false;
}

console.log("\n🟡 TRANSLATION (at least one required):");
const hasTranslation = translationVars.some((key) => isSet(key));
if (!hasTranslation) {
  console.log(
    "  ✗ Neither GROQ_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, nor GOOGLE_TRANSLATE_KEY is set"
  );
  console.log("     Articles will NOT be translated for non-Czech users");
  warnings.push("Translation engines not configured");
  success = false;
} else {
  for (const key of translationVars) {
    console.log(isSet(key) ? `  ✓ ${key}` : `  ○ ${key} (not set, using fallback)`);
  }
}

console.log("\n🟢 RECOMMENDED:");
for (const key of recommendedVars) {
  const val = env[key] || process.env[key];
  if (val?.trim()) {
    const safe = key.includes("EMAIL") ? val : key;
    console.log(`  ✓ ${key}${key.includes("EMAIL") ? ` = ${safe}` : ""}`);
  } else {
    console.log(`  ○ ${key} (using default)`);
  }
}

console.log("\n💳 STRIPE (required if using paid subscriptions):");
const hasStripe = stripeVars.every((key) => isSet(key));
if (hasStripe) {
  for (const key of stripeVars) {
    console.log(`  ✓ ${key}`);
  }
} else {
  console.log("  ⚠️  Stripe not fully configured (payments disabled)");
}

console.log("\n" + "=".repeat(50));
if (success) {
  console.log("✅ Production environment is ready!\n");
  process.exit(0);
}

console.log("❌ Fix the above errors before deploying.\n");
console.log("Missing/invalid variables:");
for (const key of errors) console.log(`  - ${key}`);
if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const msg of warnings) console.log(`  - ${msg}`);
}
process.exit(1);
