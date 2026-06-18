#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
if (!existsSync(envPath)) {
  console.log("Missing ELEVENLABS_API_KEY");
  process.exit(2);
}
const key = readFileSync(envPath, "utf8")
  .split(/\r?\n/)
  .find((l) => l.startsWith("ELEVENLABS_API_KEY="))
  ?.split("=")[1]
  ?.trim();
if (!key) {
  console.log("Missing ELEVENLABS_API_KEY");
  process.exit(2);
}

const tts = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
  method: "POST",
  headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
  body: JSON.stringify({ text: ".", model_id: "eleven_multilingual_v2" }),
});
console.log(`TTS_PROBE:${tts.status}`);
const ttsBody = await tts.text();
if (tts.ok || tts.status === 429 || tts.status === 402) {
  console.log("ElevenLabs TTS probe valid — continuing.");
  process.exit(0);
}
if (tts.status === 401 && !/invalid_api_key/i.test(ttsBody)) {
  console.log("ElevenLabs key scoped/restricted but not invalid — continuing with fallback.");
  process.exit(0);
}
console.log(`ElevenLabs TTS probe failed: ${ttsBody.slice(0, 200)}`);
process.exit(1);
