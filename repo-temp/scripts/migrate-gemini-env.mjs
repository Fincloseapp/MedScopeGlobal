/**
 * Moves misconfigured AQ.* / AIza* keys from OPENAI_* to GEMINI_API_KEY in .env.local.
 */
import fs from "fs";
import { projectPath } from "../lib/config/paths.mjs";

const envPath = projectPath(".env.local");
const backupPath = envPath + ".bak";

function isGeminiKey(v) {
  const k = (v ?? "").trim();
  return k.startsWith("AQ.") || (k.startsWith("AIza") && k.length > 20);
}

function isOpenAiKey(v) {
  const k = (v ?? "").trim();
  return k.startsWith("sk-") && k.length > 20;
}

function readKeyFromFile(filePath, names) {
  if (!fs.existsSync(filePath)) return null;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    for (const name of names) {
      const m = line.match(new RegExp(`^${name}=(.*)$`));
      if (m) {
        const val = m[1].trim();
        if (isGeminiKey(val)) return val;
      }
    }
    const commented = line.match(/^# OPENAI_API_KEY invalid.*Was: (AQ\.[^\s…]+)/);
    if (commented) return null;
  }
  return null;
}

function extractFromComment(lines) {
  for (const line of lines) {
    const m = line.match(/^# OPENAI_API_KEY invalid.*Was: (AQ\.[A-Za-z0-9_]+)/);
    if (m) return null;
  }
  return null;
}

if (!fs.existsSync(envPath)) {
  console.error("No .env.local");
  process.exit(1);
}

let geminiKey =
  readKeyFromFile(envPath, ["GEMINI_API_KEY", "GOOGLE_AI_API_KEY"]) ??
  readKeyFromFile(backupPath, ["OPENAI_API_KEY", "OPEN_API_KEY", "GEMINI_API_KEY"]);

if (!geminiKey && fs.existsSync(backupPath)) {
  for (const line of fs.readFileSync(backupPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^(OPENAI_API_KEY|OPEN_API_KEY|GEMINI_API_KEY)=(.*)$/);
    if (m && isGeminiKey(m[2])) {
      geminiKey = m[2].trim();
      break;
    }
  }
}

if (!geminiKey) {
  console.log("No Gemini key found in .env.local or .env.local.bak — nothing to migrate.");
  process.exit(0);
}

const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
const out = [];
let hasGemini = false;
let changed = false;

for (const line of lines) {
  if (/^GEMINI_API_KEY=/.test(line)) {
    hasGemini = true;
    if (line !== `GEMINI_API_KEY=${geminiKey}`) {
      out.push(`GEMINI_API_KEY=${geminiKey}`);
      changed = true;
    } else {
      out.push(line);
    }
    continue;
  }
  if (/^GOOGLE_AI_API_KEY=/.test(line) && isGeminiKey(line.split("=")[1])) {
    changed = true;
    continue;
  }
  out.push(line);
}

if (!hasGemini) {
  const modelIdx = out.findIndex((l) => l.startsWith("OPENAI_MODEL="));
  const insertAt = modelIdx >= 0 ? modelIdx + 1 : out.length;
  out.splice(
    insertAt,
    0,
    "# Google AI Studio (Gemini) — AQ. or AIza keys belong here, not OPENAI_API_KEY:",
    `GEMINI_API_KEY=${geminiKey}`,
    "GEMINI_MODEL=gemini-2.5-flash-lite"
  );
  changed = true;
}

if (!changed) {
  console.log("GEMINI_API_KEY already set.");
  process.exit(0);
}

fs.writeFileSync(envPath, out.join("\n") + "\n", "utf8");
console.log("Migrated Gemini key to GEMINI_API_KEY in .env.local");
