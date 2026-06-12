import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Dynamic import of repo-root .mjs modules (Vercel: requires outputFileTracingIncludes). */
export async function importMjs<T = Record<string, unknown>>(relativePath: string): Promise<T> {
  const absolute = join(process.cwd(), relativePath);
  if (!existsSync(absolute)) {
    throw new Error(`Cannot find module '${pathToFileURL(absolute).href}'`);
  }
  return import(pathToFileURL(absolute).href) as Promise<T>;
}
