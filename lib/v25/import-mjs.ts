/**
 * Legacy cwd-based .mjs loader — do not use in Vercel serverless runners.
 * Prefer static `import("../path/to/module.mjs")` from runner files so Next bundles modules.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function importMjs<T = Record<string, unknown>>(relativePath: string): Promise<T> {
  const absolute = join(process.cwd(), relativePath);
  if (!existsSync(absolute)) {
    throw new Error(`Cannot find module '${pathToFileURL(absolute).href}'`);
  }
  return import(pathToFileURL(absolute).href) as Promise<T>;
}
