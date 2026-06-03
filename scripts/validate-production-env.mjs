#!/usr/bin/env node

/**
 * Validate environment variables for MedScopeGlobal production deployment
 * Run: node scripts/validate-production-env.mjs
 */

import process from 'process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local if it exists
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key.trim()) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'CRON_SECRET',
];

const translationVars = [
  'OPENAI_API_KEY',
  'OPEN_API_KEY',
  'GOOGLE_TRANSLATE_KEY',
];

const recommendedVars = [
  'INGESTION_LOCALE',
  'DEFAULT_SITE_LOCALE',
  'ADMIN_NOTIFY_EMAIL',
];

const stripeVars = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
];

console.log('\n📋 MedScopeGlobal Production Environment Validation\n');

let errors = [];
let warnings = [];
let success = true;

// Check required
console.log('🔴 REQUIRED:');
requiredVars.forEach(key => {
  const val = process.env[key];
  if (!val || !val.trim()) {
    console.log(`  ✗ ${key}`);
    errors.push(key);
    success = false;
  } else {
    const masked = val.substring(0, 10) + '...' + val.substring(val.length - 5);
    console.log(`  ✓ ${key} = ${masked}`);
  }
});

// Check translation (at least one required)
console.log('\n🟡 TRANSLATION (at least one required):');
const hasTranslation = translationVars.some(key => process.env[key]?.trim());
if (!hasTranslation) {
  console.log(`  ✗ Neither OPENAI_API_KEY nor GOOGLE_TRANSLATE_KEY is set`);
  console.log(`     Articles will NOT be translated for non-Czech users`);
  warnings.push('Translation engines not configured');
  success = false;
} else {
  translationVars.forEach(key => {
    const val = process.env[key];
    if (val?.trim()) {
      const masked = val.substring(0, 10) + '...';
      console.log(`  ✓ ${key} = ${masked}`);
    } else {
      console.log(`  ○ ${key} (not set, using fallback)`);
    }
  });
}

// Check recommended
console.log('\n🟢 RECOMMENDED:');
recommendedVars.forEach(key => {
  const val = process.env[key];
  if (val?.trim()) {
    console.log(`  ✓ ${key} = ${val}`);
  } else {
    console.log(`  ○ ${key} (using default)`);
  }
});

// Check Stripe
console.log('\n💳 STRIPE (required if using paid subscriptions):');
const hasStripe = stripeVars.every(key => process.env[key]?.trim());
if (hasStripe) {
  stripeVars.forEach(key => {
    const masked = process.env[key].substring(0, 10) + '...';
    console.log(`  ✓ ${key} = ${masked}`);
  });
} else {
  console.log(`  ⚠️  Stripe not fully configured (payments disabled)`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (success) {
  console.log('✅ Production environment is ready!\n');
  process.exit(0);
} else {
  console.log('❌ Fix the above errors before deploying.\n');
  console.log('Missing/invalid variables:');
  errors.forEach(key => console.log(`  - ${key}`));
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(msg => console.log(`  - ${msg}`));
  }
  process.exit(1);
}
