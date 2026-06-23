import { join, resolve } from "node:path";



/** Vercel/serverless — ephemeral /tmp only (not persisted). */

export const isVercel = process.env.VERCEL === "1";

const isCI = process.env.GITHUB_ACTIONS === "true";

const isWin = process.platform === "win32";

const isLocalDev = !isVercel && !isCI;

/** Canonical NTFS workspace (replaces D: FAT32 / legacy D:\\medscope.*). */
const NTFS_ROOT = "C:\\_NTFS\\MedScopeGlobal";



/**

 * On Windows local dev, reject resolved paths on C: unless under C:\\_NTFS\\ or MEDSCOPE_ALLOW_C_DRIVE=1.

 * Call before any local filesystem write when the path is not from these helpers.

 */

export function assertNotOnCDrive(resolvedPath: string, label: string): void {

  if (!isWin || !isLocalDev) return;

  const normalized = resolve(resolvedPath).replace(/\//g, "\\");

  if (/^C:\\_NTFS\\/i.test(normalized)) return;

  if (/^C:\\/i.test(normalized)) {

    const msg =

      `[MedScope paths] ${label} resolves to C: drive (${normalized}). ` +

      `Use ${NTFS_ROOT}\\repo-temp, ${NTFS_ROOT}\\data, or ${NTFS_ROOT}\\logs only.`;

    if (process.env.MEDSCOPE_ALLOW_C_DRIVE === "1") {

      console.warn(msg);

    } else {

      throw new Error(msg);

    }

  }

}



function guardRoots(): void {

  if (!isLocalDev) return;

  assertNotOnCDrive(MEDSCOPE_PROJECT_ROOT, "MEDSCOPE_PROJECT_ROOT");

  assertNotOnCDrive(MEDSCOPE_DATA_ROOT, "MEDSCOPE_DATA_ROOT");

  assertNotOnCDrive(MEDSCOPE_LOGS_ROOT, "MEDSCOPE_LOGS_ROOT");

  assertNotOnCDrive(MEDSCOPE_LOCAL_DATA_DIR, "MEDSCOPE_LOCAL_DATA_DIR");

  assertNotOnCDrive(MEDSCOPE_LOGO_SOURCE, "MEDSCOPE_LOGO_SOURCE");

}



/**

 * Canonical project root.

 * Local dev: C:\\_NTFS\\MedScopeGlobal\\repo-temp (NTFS — avoids FAT32 EISDIR).

 * Vercel/CI: process.cwd() (ephemeral build dir).

 */

export const MEDSCOPE_PROJECT_ROOT =

  process.env.MEDSCOPE_PROJECT_ROOT ??

  (isVercel || isCI ? process.cwd() : join(NTFS_ROOT, "repo-temp"));



/** Off-repo data: articles, images, auth, ads, audit. Local: C:\\_NTFS\\MedScopeGlobal\\data. */

export const MEDSCOPE_DATA_ROOT =

  process.env.MEDSCOPE_DATA_ROOT ??

  (isVercel ? "/tmp/medscope.data" : join(NTFS_ROOT, "data"));



/** Off-repo logs. Local: C:\\_NTFS\\MedScopeGlobal\\logs. */

export const MEDSCOPE_LOGS_ROOT =

  process.env.MEDSCOPE_LOGS_ROOT ??

  (isVercel ? "/tmp/medscope.logs" : join(NTFS_ROOT, "logs"));



/** In-repo scratch under project on D: (alternative to medscope.data). */

export const MEDSCOPE_LOCAL_DATA_DIR =

  process.env.MEDSCOPE_LOCAL_DATA_DIR ?? join(MEDSCOPE_PROJECT_ROOT, ".data");



/** Logo assets source (outside repo). */

export const MEDSCOPE_LOGO_SOURCE =

  process.env.MEDSCOPE_LOGO_SOURCE ?? join(NTFS_ROOT, "logo");



guardRoots();



export function projectPath(...parts: string[]): string {

  const p = join(MEDSCOPE_PROJECT_ROOT, ...parts);

  assertNotOnCDrive(p, "projectPath");

  return p;

}



export function dataPath(...parts: string[]): string {

  const p = join(MEDSCOPE_DATA_ROOT, ...parts);

  assertNotOnCDrive(p, "dataPath");

  return p;

}



export function logPath(...parts: string[]): string {

  const p = join(MEDSCOPE_LOGS_ROOT, ...parts);

  assertNotOnCDrive(p, "logPath");

  return p;

}



/** Alias for logPath (D:\\medscope.logs). */

export const logsPath = logPath;



export function localDataPath(...parts: string[]): string {

  const p = join(MEDSCOPE_LOCAL_DATA_DIR, ...parts);

  assertNotOnCDrive(p, "localDataPath");

  return p;

}


