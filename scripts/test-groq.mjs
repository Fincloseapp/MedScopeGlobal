import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const { isGroqConfigured } = await import(
  pathToFileURL(path.join(root, "lib/ai/groq.ts")).href
);
const { resolvePrimaryLlmProvider, generateJsonFromLlm } = await import(
  pathToFileURL(path.join(root, "lib/ai/chat-json.ts")).href
);

console.log("groq configured:", isGroqConfigured());
console.log("primary provider:", resolvePrimaryLlmProvider());

const raw = await generateJsonFromLlm({
  system: 'Reply JSON only: {"ok":true,"engine":"groq"}',
  user: "ping",
  maxTokens: 64,
});
console.log("response:", raw ?? "(null)");
process.exit(raw ? 0 : 1);
