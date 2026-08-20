import { existsSync } from "node:fs";
import { join, resolve } from "node:path";



/** Vercel/serverless — ephemeral /tmp only (not persisted). */

export const isVercel = process.env.VERCEL === "1";

export const isCloudflareWorkers = process.env.MEDSCOPE_RUNTIME === "cloudflare-workers";

export const isServerlessRuntime = isVercel || isCloudflareWorkers;

const isCI = process.env.GITHUB_ACTIONS === "true";

const isWin = process.platform === "win32";

const isLocalDev = !isServerlessRuntime && !isCI;

function defaultLocalProjectRoot(): string {
  if (process.env.MEDSCOPE_PROJECT_ROOT) return process.env.MEDSCOPE_PROJECT_ROOT;
  if (isServerlessRuntime || isCI) return process.cwd();
  if (isWin) {
    const cwd = resolve(process.cwd());
    if (/^D:\\/i.test(cwd) && existsSync(join(cwd, "package.json"))) return cwd;
    if (existsSync("D:\\Medi82026\\package.json")) return "D:\\Medi82026";
    return "D:\\medscope.local";
  }
  return process.cwd();
}

function defaultLocalSideRoot(
  envName: string,
  projectRoot: string,
  folder: string,
  classicWinPath: string,
  serverlessPath: string
): string {
  if (process.env[envName]) return process.env[envName] as string;
  if (isServerlessRuntime) return serverlessPath;
  if (/medi82026/i.test(projectRoot)) return join(projectRoot, folder);
  // Windows and this Linux workspace both use the D:\ side folders.
  return classicWinPath;
}

/**

 * On Windows local dev, reject resolved paths on C: unless MEDSCOPE_ALLOW_C_DRIVE=1.

 * Call before any local filesystem write when the path is not from these helpers.

 */

export function assertNotOnCDrive(resolvedPath: string, label: string): void {

  if (!isWin || !isLocalDev) return;

  const normalized = resolve(resolvedPath).replace(/\//g, "\\");

  if (/^C:\\/i.test(normalized)) {

    const msg =

      `[MedScope paths] ${label} resolves to C: drive (${normalized}). ` +

      "Use D:\\Medi82026, D:\\medscope.local, D:\\medscope.data, or D:\\medscope.logs only.";

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

 * Windows: D:\Medi82026 when present, else cwd on D:, else D:\medscope.local.

 * Linux / CI / serverless: process.cwd() (never the nested snapshot folder).

 */

export const MEDSCOPE_PROJECT_ROOT = defaultLocalProjectRoot();

/** Off-repo data. Medi82026: D:\Medi82026\data. Jinak D:\medscope.data. */

export const MEDSCOPE_DATA_ROOT = defaultLocalSideRoot(
  "MEDSCOPE_DATA_ROOT",
  MEDSCOPE_PROJECT_ROOT,
  "data",
  "D:\\medscope.data",
  "/tmp/medscope.data"
);

export const MEDSCOPE_LOGS_ROOT = defaultLocalSideRoot(
  "MEDSCOPE_LOGS_ROOT",
  MEDSCOPE_PROJECT_ROOT,
  "logs",
  "D:\\medscope.logs",
  "/tmp/medscope.logs"
);



/** In-repo scratch under project on D: (alternative to medscope.data). */

export const MEDSCOPE_LOCAL_DATA_DIR =

  process.env.MEDSCOPE_LOCAL_DATA_DIR ?? join(MEDSCOPE_PROJECT_ROOT, ".data");



/** Logo assets source on D: (outside repo). */

export const MEDSCOPE_LOGO_SOURCE =

  process.env.MEDSCOPE_LOGO_SOURCE ?? "D:\\MedScopeGlobal\\logo";



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


