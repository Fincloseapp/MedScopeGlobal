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
const res = await fetch("https://api.elevenlabs.io/v1/user", {
  headers: { "xi-api-key": key },
});
console.log(`ELEVENLABS_STATUS:${res.status}`);
if (res.status === 401) {
  console.log("Invalid ElevenLabs API key — regenerate.");
  process.exit(1);
}
if (res.status === 200) {
  console.log("ElevenLabs key valid — continuing.");
  process.exit(0);
}
console.log(`Unexpected status ${res.status}`);
process.exit(3);
