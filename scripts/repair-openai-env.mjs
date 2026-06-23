/**
 * Repairs .env.local when OPENAI_API_KEY contains a non-OpenAI key (e.g. AQ.*).
 * Backs up to .env.local.bak, comments invalid keys, adds placeholder.
 */
import fs from "fs";
import { projectPath } from "../lib/config/paths.mjs";

const envPath = projectPath(".env.local");

function isValidOpenAiKey(v) {
  const k = (v ?? "").trim();
  return k.startsWith("sk-") && k.length > 20;
}

if (!fs.existsSync(envPath)) {
  console.error("No .env.local found");
  process.exit(1);
}

const original = fs.readFileSync(envPath, "utf8");
const backup = envPath + ".bak";
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, original, "utf8");
  console.log("Backup:", backup);
}

const lines = original.split(/\r?\n/);
let changed = false;
const out = [];

for (const line of lines) {
  const m = line.match(/^(OPENAI_API_KEY|OPEN_API_KEY)=(.*)$/);
  if (m) {
    const val = m[2].trim();
    if (val && !isValidOpenAiKey(val)) {
      out.push(`# ${m[1]} invalid (must start with sk-). Was: ${val.slice(0, 8)}…`);
      out.push(`# ${m[1]}=sk-your-openai-key-from-platform-openai-com`);
      changed = true;
      continue;
    }
  }
  out.push(line);
}

if (!changed) {
  console.log("OPENAI_API_KEY already valid or empty — no changes.");
  process.exit(0);
}

if (!out.some((l) => /^OPENAI_API_KEY=sk-/.test(l))) {
  const idx = out.findIndex((l) => l.startsWith("# OPENAI_API_KEY=sk-"));
  if (idx === -1) {
    out.push("");
    out.push("# Add your OpenAI key (https://platform.openai.com/api-keys):");
    out.push("OPENAI_API_KEY=");
  }
}

fs.writeFileSync(envPath, out.join("\n") + "\n", "utf8");
console.log("Repaired .env.local — set OPENAI_API_KEY=sk-… or run: node scripts/migrate-gemini-env.mjs");
