/**
 * V5/V5+ AI pipeline diagnostic (read-only checks + optional live Groq ping).
 * Usage: npx tsx scripts/diagnose-ai-pipeline.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const issues = [];
const fixes = [];
const ok = [];

function check(cond, passMsg, failMsg) {
  if (cond) ok.push(passMsg);
  else issues.push(failMsg);
}

const groqPath = path.join(root, "lib/ai/groq.ts");
const chatPath = path.join(root, "lib/ai/chat-json.ts");
const assistantPath = path.join(root, "lib/ai-medical/assistant.ts");

check(fs.existsSync(groqPath), "lib/ai/groq.ts exists", "MISSING lib/ai/groq.ts");
check(fs.existsSync(chatPath), "lib/ai/chat-json.ts exists", "MISSING lib/ai/chat-json.ts");

const groqSrc = fs.readFileSync(groqPath, "utf8");
check(
  groqSrc.includes("api.groq.com/openai/v1/chat/completions"),
  "Groq endpoint OK",
  "Groq endpoint wrong"
);
check(
  groqSrc.includes("llama-3.3-70b-versatile"),
  "Groq primary model = llama-3.3-70b-versatile (V5+ current)",
  "Groq primary model not updated"
);

const key = process.env.GROQ_API_KEY?.trim();
check(
  key?.startsWith("gsk_") && key.length > 20,
  "GROQ_API_KEY present in .env.local",
  "GROQ_API_KEY missing or invalid in .env.local"
);

const chatSrc = fs.readFileSync(chatPath, "utf8");
check(
  chatSrc.includes("groqGenerateJson(input)") &&
    chatSrc.indexOf("groqGenerateJson") < chatSrc.indexOf("generateJsonFromGemini"),
  "chat-json: Groq before Gemini/OpenAI",
  "chat-json: Groq NOT first in chain"
);
check(
  chatSrc.includes("generateTextFromLlm"),
  "generateTextFromLlm exported",
  "MISSING generateTextFromLlm"
);

const assistantSrc = fs.readFileSync(assistantPath, "utf8");
check(
  assistantSrc.includes("generateJsonFromLlm"),
  "AI Medical uses generateJsonFromLlm",
  "AI Medical missing generateJsonFromLlm"
);
check(
  assistantSrc.includes("NO_SUPABASE_EXCUSE"),
  "Anti-Supabase-limitation prompt present",
  "MISSING anti-Supabase prompt"
);
check(
  assistantSrc.includes("tryGroqPlainTextAnswer"),
  "Groq plain-text fallback present",
  "MISSING Groq plain-text fallback"
);

const v5plus = [
  "lib/v5plus/citations.ts",
  "lib/v5plus/evidence-scoring.ts",
  "lib/v4d/categorize.ts",
  "lib/v4d/medical-ai-process.ts",
];
for (const f of v5plus) {
  const src = fs.readFileSync(path.join(root, f), "utf8");
  check(
    src.includes("generateJsonFromLlm") || src.includes("chat-json"),
    `${f} uses unified LLM`,
    `${f} may bypass Groq chain`
  );
}
const fetchSrc = fs.readFileSync(path.join(root, "lib/v4d/medical-ai-fetch.ts"), "utf8");
check(
  fetchSrc.includes("categorizeMedicalText") &&
    fetchSrc.includes("enrichMedicalArticleWithEvidence") &&
    fetchSrc.includes("processMedicalTextWithAi"),
  "medical-ai-fetch: categorize + AI process + V5+ enrich (Groq via deps)",
  "medical-ai-fetch missing V5+ pipeline hooks"
);

const blocked = fs.readFileSync(path.join(root, "lib/ai/reply-sanitize.ts"), "utf8");
check(
  blocked.includes("vzhledem k omezen"),
  "reply-sanitize blocks Supabase excuse phrases",
  "reply-sanitize missing"
);

// Live Groq ping
const { isGroqConfigured, resolvePrimaryLlmProvider, generateJsonFromLlm } =
  await import(pathToFileURL(path.join(root, "lib/ai/chat-json.ts")).href);

check(isGroqConfigured(), "Groq configured at runtime", "Groq NOT configured at runtime");
console.log("\n--- Live test ---");
console.log("primary provider:", resolvePrimaryLlmProvider());
const ping = await generateJsonFromLlm({
  system: 'JSON only: {"status":"ok"}',
  user: "ping",
  maxTokens: 32,
});
check(!!ping, "Groq/Gemini/OpenAI JSON ping OK", "LLM ping returned null");

console.log("\n=== NALEZENÉ PROBLÉMY ===");
issues.forEach((i) => console.log("✗", i));
console.log("\n=== OVĚŘENO OK ===");
ok.forEach((o) => console.log("✓", o));
console.log("\n=== PROVEDENÉ OPRAVY (tato session) ===");
[
  "generateTextFromLlm + warnIfGroqKeyMissing",
  "AI Medical: NO_SUPABASE_EXCUSE + tryGroqPlainTextAnswer",
  "reply-sanitize.ts — filtr frází o omezení Supabase",
  "ai/query → Groq-first přes generateTextFromLlm",
].forEach((f) => console.log("•", f));

process.exit(issues.length ? 1 : 0);
