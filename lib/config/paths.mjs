import { join } from "node:path";

/** Vercel/serverless — ephemeral /tmp only (not persisted). */
export const isVercel = process.env.VERCEL === "1";
const isCI = process.env.GITHUB_ACTIONS === "true";

export const MEDSCOPE_PROJECT_ROOT =
  process.env.MEDSCOPE_PROJECT_ROOT ??
  (isVercel || isCI ? process.cwd() : "D:\\medscope.local");

export const MEDSCOPE_DATA_ROOT =
  process.env.MEDSCOPE_DATA_ROOT ??
  (isVercel ? "/tmp/medscope.data" : "D:\\medscope.data");

export const MEDSCOPE_LOGS_ROOT =
  process.env.MEDSCOPE_LOGS_ROOT ??
  (isVercel ? "/tmp/medscope.logs" : "D:\\medscope.logs");

export const MEDSCOPE_LOCAL_DATA_DIR =
  process.env.MEDSCOPE_LOCAL_DATA_DIR ?? join(MEDSCOPE_PROJECT_ROOT, ".data");

export const MEDSCOPE_LOGO_SOURCE =
  process.env.MEDSCOPE_LOGO_SOURCE ?? "D:\\MedScopeGlobal\\logo";

export function projectPath(...parts) {
  return join(MEDSCOPE_PROJECT_ROOT, ...parts);
}

export function dataPath(...parts) {
  return join(MEDSCOPE_DATA_ROOT, ...parts);
}

export function logPath(...parts) {
  return join(MEDSCOPE_LOGS_ROOT, ...parts);
}

export function localDataPath(...parts) {
  return join(MEDSCOPE_LOCAL_DATA_DIR, ...parts);
}
