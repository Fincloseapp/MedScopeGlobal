import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function loadEnvLocal() {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}
