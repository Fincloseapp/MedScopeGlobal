import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export function getProjectRoot(fromDir = scriptDir) {
  return path.join(fromDir, "..");
}

/** Strip optional surrounding quotes and stray whitespace from .env values. */
export function normalizeEnvValue(raw) {
  if (raw == null) return "";
  let value = String(raw).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.trim();
}

/** Parse a .env file into a key/value map (cross-platform, quote-safe). */
export function parseEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = normalizeEnvValue(trimmed.slice(eq + 1));
    if (key) env[key] = value;
  }
  return env;
}

/** Load .env then .env.local (local overrides). All paths stay under project root. */
export function loadProjectEnv(root = getProjectRoot()) {
  return {
    ...parseEnvFile(path.join(root, ".env")),
    ...parseEnvFile(path.join(root, ".env.local")),
  };
}

/** Populate process.env from .env.local when keys are not already set. */
export function loadEnvLocal(root = getProjectRoot()) {
  const parsed = parseEnvFile(path.join(root, ".env.local"));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]) process.env[key] = value;
  }
}
