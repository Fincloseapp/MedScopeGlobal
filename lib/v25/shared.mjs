import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dir, "..", "..");

const isVercel = process.env.VERCEL === "1";
export const DATA_ROOT =
  process.env.MEDSCOPE_DATA_ROOT ?? (isVercel ? "/tmp/medscope.data" : "D:\\medscope.data");
export const LOGS_ROOT =
  process.env.MEDSCOPE_LOGS_ROOT ?? (isVercel ? "/tmp/medscope.logs" : "D:\\medscope.logs");
export const BASE =
  process.env.PROD_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com";

export function dataPath(...parts) {
  return join(DATA_ROOT, ...parts);
}

export function logPath(...parts) {
  return join(LOGS_ROOT, ...parts);
}

export function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

export function writeJson(rel, data) {
  const full = dataPath(rel);
  ensureDir(dirname(full));
  writeFileSync(full, JSON.stringify(data, null, 2), "utf8");
  return full;
}

export function readJson(rel) {
  const full = dataPath(rel);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8"));
  } catch {
    return null;
  }
}

export function appendLog(file, line) {
  const full = logPath(file);
  ensureDir(dirname(full));
  appendFileSync(full, `[${new Date().toISOString()}] ${line}\n`, "utf8");
  return full;
}

export async function fetchPage(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "MedScopeGlobal-v25.1-linktest" },
  });
  const text = await res.text();
  return { res, text, url: res.url };
}

export function extractLinks(html, baseUrl) {
  const links = new Set();
  const re = /href=["']([^"'#]+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    try {
      const abs = new URL(href, baseUrl).href;
      if (abs.includes("medscopeglobal.com") || abs.startsWith(baseUrl)) links.add(abs.split("#")[0]);
    } catch {
      /* skip */
    }
  }
  return [...links];
}
