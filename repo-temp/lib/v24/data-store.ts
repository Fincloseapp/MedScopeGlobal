import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { V24_DATA_ROOT, V24_DATA_PATHS, V24_LOGS_ROOT, V24_LOG_PATHS } from "@/lib/v24/config";

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

export function v24DataPath(...parts: string[]) {
  return join(V24_DATA_ROOT, ...parts);
}

export function v24LogPath(...parts: string[]) {
  return join(V24_LOGS_ROOT, ...parts);
}

export function writeV24Json(relativePath: string, data: unknown) {
  try {
    const full = v24DataPath(relativePath);
    ensureDir(join(full, ".."));
    writeFileSync(full, JSON.stringify(data, null, 2), "utf8");
    return full;
  } catch {
    return null;
  }
}

export function readV24Json<T>(relativePath: string): T | null {
  const full = v24DataPath(relativePath);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function appendV24Log(category: keyof typeof V24_LOG_PATHS, line: string) {
  try {
    const dir = v24LogPath(V24_LOG_PATHS[category]);
    ensureDir(dir);
    const file = join(dir, `${new Date().toISOString().slice(0, 10)}.log`);
    appendFileSync(file, `[${new Date().toISOString()}] ${line}\n`, "utf8");
    return file;
  } catch {
    return null;
  }
}

export function artifactPath(section: string, topicHash: string) {
  return join(V24_DATA_PATHS.articles, section, `${topicHash}.json`);
}

export function imagePath(section: string, topicHash: string, ext = "svg") {
  return join(V24_DATA_PATHS.images, section, `${topicHash}.${ext}`);
}

export function quizPath(slug: string) {
  return join(V24_DATA_PATHS.quizzes, `${slug}.json`);
}

export function topicMapPath() {
  return join(V24_DATA_PATHS.topicMap, "index.json");
}
