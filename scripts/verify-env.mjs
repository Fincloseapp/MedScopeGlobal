/**
 * Cross-platform env preflight — never logs secret values.
 * Run: node scripts/verify-env.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import { loadProjectEnv, normalizeEnvValue } from "./load-env.mjs";

const MIN_CRON_SECRET_LEN = 16;

export function validateCronSecret(env) {
  const raw = env.CRON_SECRET;
  const secret = normalizeEnvValue(raw);
  if (!secret) {
    return { ok: false, reason: "CRON_SECRET is missing or empty" };
  }
  if (secret.length < MIN_CRON_SECRET_LEN) {
    return {
      ok: false,
      reason: `CRON_SECRET too short (need >= ${MIN_CRON_SECRET_LEN} chars after normalization)`,
    };
  }
  return { ok: true };
}

export function runEnvPreflight(options = {}) {
  const root =
    options.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  const fileEnv = loadProjectEnv(root);
  const env =
    options.env ??
    {
      ...fileEnv,
      ...(process.env.CRON_SECRET ? { CRON_SECRET: process.env.CRON_SECRET } : {}),
    };
  const errors = [];

  const cron = validateCronSecret(env);
  if (!cron.ok) errors.push(cron.reason);

  return { ok: errors.length === 0, errors, env };
}

function runCli() {
  const result = runEnvPreflight();
  if (result.ok) {
    console.log("✓ CRON_SECRET configured");
    process.exit(0);
  }
  for (const msg of result.errors) {
    console.error("✗", msg);
  }
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain) {
  runCli();
}
