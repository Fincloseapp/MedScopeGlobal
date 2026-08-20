import { existsSync } from "node:fs";
import { join, resolve } from "node:path";



/** Vercel/serverless — ephemeral /tmp only (not persisted). */

export const isVercel = process.env.VERCEL === "1";

export const isCloudflareWorkers = process.env.MEDSCOPE_RUNTIME === "cloudflare-workers";

export const isServerlessRuntime = isVercel || isCloudflareWorkers;

const isCI = process.env.GITHUB_ACTIONS === "true";

const isWin = process.platform === "win32";

const isLocalDev = !isServerlessRuntime && !isCI;

function defaultLocalProjectRoot() {
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

function defaultLocalSideRoot(envName, projectRoot, folder, classicWinPath, serverlessPath) {
  if (process.env[envName]) return process.env[envName];
  if (isServerlessRuntime) return serverlessPath;
  if (/medi82026/i.test(projectRoot)) return join(projectRoot, folder);
  // Windows and this Linux workspace both use the D:\ side folders.
  return classicWinPath;
}

export function assertNotOnCDrive(resolvedPath, label) {

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



function guardRoots() {

  if (!isLocalDev) return;

  assertNotOnCDrive(MEDSCOPE_PROJECT_ROOT, "MEDSCOPE_PROJECT_ROOT");

  assertNotOnCDrive(MEDSCOPE_DATA_ROOT, "MEDSCOPE_DATA_ROOT");

  assertNotOnCDrive(MEDSCOPE_LOGS_ROOT, "MEDSCOPE_LOGS_ROOT");

  assertNotOnCDrive(MEDSCOPE_LOCAL_DATA_DIR, "MEDSCOPE_LOCAL_DATA_DIR");

  assertNotOnCDrive(MEDSCOPE_LOGO_SOURCE, "MEDSCOPE_LOGO_SOURCE");

}



export const MEDSCOPE_PROJECT_ROOT = defaultLocalProjectRoot();

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


