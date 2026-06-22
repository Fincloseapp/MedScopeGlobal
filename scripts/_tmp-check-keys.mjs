import fs from "node:fs";
import path from "node:path";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";

const root = MEDSCOPE_PROJECT_ROOT;
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

console.log("GROQ:", Boolean(env.GROQ_API_KEY));
console.log("GEMINI:", Boolean(env.GEMINI_API_KEY));
console.log("MODEL:", env.GROQ_MODEL_PRIMARY || env.AI_MODEL || "llama-3.1-70b-versatile");
