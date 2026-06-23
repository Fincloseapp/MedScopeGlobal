import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { V25_DATA_ROOT, V25_LOGS_ROOT, V25_DATA_PATHS, V25_LOG_PATHS } from "@/lib/v25/config";

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

export function v25DataPath(...parts: string[]) {
  return join(V25_DATA_ROOT, ...parts);
}

export function v25LogPath(...parts: string[]) {
  return join(V25_LOGS_ROOT, ...parts);
}

export function writeV25Json(relativePath: string, data: unknown) {
  const full = v25DataPath(relativePath);
  ensureDir(dirname(full));
  writeFileSync(full, JSON.stringify(data, null, 2), "utf8");
  return full;
}

export function readV25Json<T>(relativePath: string): T | null {
  const full = v25DataPath(relativePath);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function appendV25Log(category: keyof typeof V25_LOG_PATHS, line: string) {
  const file = v25LogPath(V25_LOG_PATHS[category]);
  ensureDir(dirname(file));
  appendFileSync(file, `[${new Date().toISOString()}] ${line}\n`, "utf8");
  return file;
}

export function screenshotDir() {
  const dir = v25DataPath(V25_DATA_PATHS.screenshots);
  ensureDir(dir);
  return dir;
}

export { V25_DATA_PATHS };
