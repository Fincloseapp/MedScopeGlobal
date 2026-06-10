import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { V25_DATA_ROOT } from "@/lib/v25/config";

export const V25_IMAGES_ROOT = join(V25_DATA_ROOT, "images");

export function v25ImagePath(...parts: string[]) {
  return join(V25_IMAGES_ROOT, ...parts);
}

export function ensureImagesDir() {
  mkdirSync(V25_IMAGES_ROOT, { recursive: true });
  return V25_IMAGES_ROOT;
}

export function readLocalImage(relativePath: string): Buffer | null {
  const full = join(V25_DATA_ROOT, relativePath.replace(/^\//, ""));
  if (!existsSync(full)) return null;
  try {
    return readFileSync(full);
  } catch {
    return null;
  }
}

export function writeLocalImage(relativePath: string, content: string | Buffer) {
  const full = join(V25_DATA_ROOT, relativePath.replace(/^\//, ""));
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  return full;
}

export function publicImageUrl(relativePath: string, baseUrl?: string) {
  const site = (baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");
  const rel = relativePath.replace(/\\/g, "/").replace(/^images\//, "");
  return `${site}/api/v25/images/asset/${rel}`;
}
