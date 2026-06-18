import { join, resolve } from "node:path";



/** Vercel/serverless — ephemeral /tmp only (not persisted). */

export const isVercel = process.env.VERCEL === "1";

const isCI = process.env.GITHUB_ACTIONS === "true";

const isWin = process.platform === "win32";

const isLocalDev = !isVercel && !isCI;



export function assertNotOnCDrive(resolvedPath, label) {

  if (!isWin || !isLocalDev) return;

  const normalized = resolve(resolvedPath).replace(/\//g, "\\");

  if (/^C:\\/i.test(normalized)) {

    const msg =

      `[MedScope paths] ${label} resolves to C: drive (${normalized}). ` +

      "Use D:\\medscope.local, D:\\medscope.data, or D:\\medscope.logs only.";

    if (process.env.MEDSCOPE_ALLOW_C_DRIVE === "1") {

      console.warn(msg);

    } else {

      throw new Error(msg);

    }

  }

}



function guardRoots() {

  if (!isLocalDev) return;

  assertNotOnCDrive(MEDSCOPE_PROJECT_ROOT, "MEDSCOPE_PROJECT_ROOT");

  assertNotOnCDrive(MEDSCOPE_DATA_ROOT, "MEDSCOPE_DATA_ROOT");

  assertNotOnCDrive(MEDSCOPE_LOGS_ROOT, "MEDSCOPE_LOGS_ROOT");

  assertNotOnCDrive(MEDSCOPE_LOCAL_DATA_DIR, "MEDSCOPE_LOCAL_DATA_DIR");

  assertNotOnCDrive(MEDSCOPE_LOGO_SOURCE, "MEDSCOPE_LOGO_SOURCE");

}



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



guardRoots();



export function projectPath(...parts) {

  const p = join(MEDSCOPE_PROJECT_ROOT, ...parts);

  assertNotOnCDrive(p, "projectPath");

  return p;

}



export function dataPath(...parts) {

  const p = join(MEDSCOPE_DATA_ROOT, ...parts);

  assertNotOnCDrive(p, "dataPath");

  return p;

}



export function logPath(...parts) {

  const p = join(MEDSCOPE_LOGS_ROOT, ...parts);

  assertNotOnCDrive(p, "logPath");

  return p;

}



export const logsPath = logPath;



export function localDataPath(...parts) {

  const p = join(MEDSCOPE_LOCAL_DATA_DIR, ...parts);

  assertNotOnCDrive(p, "localDataPath");

  return p;

}


