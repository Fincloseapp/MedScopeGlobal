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

const geminiKey = env.GEMINI_API_KEY;
const model = env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: 'Return JSON: {"content":"hello world test","slides":[{"title":"T","body":"B"}]}' }] }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 500 },
  }),
});
console.log("status:", res.status);
const data = await res.json();
console.log(JSON.stringify(data, null, 2).slice(0, 2000));
