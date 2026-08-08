import { resolveOpenAiKey } from "@/lib/ai/openai-key";
import { resolveGroqKey } from "@/lib/ai/groq";

export type TranscribeResult = {
  text: string;
  provider: string;
};

/** Bias Whisper toward Czech clinical vocabulary (dialogue + anamnesis). */
const MEDICAL_STT_PROMPT =
  "Ambulantní vyšetření ve spisovné češtině. Rozhovor lékaře s pacientem. " +
  "Anamnéza, nynější onemocnění, osobní anamnéza, rodinná anamnéza, " +
  "farmakologická anamnéza, alergie, abúzus, objektivní nález, diagnóza, " +
  "terapie, doporučení, kontrola. Léky: Paralen, Ibalgin, Prednison, Warfarin, " +
  "Metformin, Amlodipin, Bisoprolol, Atorvastatin, Omeprazol. " +
  "Jednotky: mmHg, tepů/min, °C, mg, tbl.";

const STT_TIMEOUT_MS = 280_000;

async function transcribeWithOpenAi(
  buffer: Buffer,
  mimeType: string,
  apiKey: string,
  originalName?: string
): Promise<TranscribeResult> {
  const form = new FormData();
  const filename = guessFilename(mimeType, originalName);
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType || "audio/mp4" });
  form.append("file", blob, filename);
  form.append("model", "whisper-1"); // filename via mime
  form.append("language", "cs");
  form.append("prompt", MEDICAL_STT_PROMPT);
  form.append("temperature", "0");
  form.append("response_format", "json");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(STT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI STT selhalo (${res.status}): ${err.slice(0, 200)}`);
  }

  const json = (await res.json()) as { text?: string };
  const text = json.text?.trim() ?? "";
  if (!text) throw new Error("OpenAI STT vrátil prázdný přepis.");
  return { text, provider: "openai:whisper-1" };
}

async function transcribeWithGroq(
  buffer: Buffer,
  mimeType: string,
  apiKey: string,
  originalName?: string
): Promise<TranscribeResult> {
  const form = new FormData();
  const filename = guessFilename(mimeType, originalName);
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType || "audio/mp4" });
  form.append("file", blob, filename);
  form.append("model", "whisper-large-v3");
  form.append("language", "cs");
  form.append("prompt", MEDICAL_STT_PROMPT);
  form.append("temperature", "0");
  form.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(STT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq STT selhalo (${res.status}): ${err.slice(0, 200)}`);
  }

  const json = (await res.json()) as { text?: string };
  const text = json.text?.trim() ?? "";
  if (!text) throw new Error("Groq STT vrátil prázdný přepis.");
  return { text, provider: "groq:whisper-large-v3" };
}

function guessFilename(mimeType: string, originalName?: string): string {
  const name = (originalName || "").toLowerCase();
  if (name.endsWith(".m4a")) return "audio.m4a";
  if (name.endsWith(".mp3")) return "audio.mp3";
  if (name.endsWith(".wav")) return "audio.wav";
  if (name.endsWith(".aac")) return "audio.aac";
  if (name.endsWith(".ogg")) return "audio.ogg";
  if (name.endsWith(".webm")) return "audio.webm";
  const m = (mimeType || "").toLowerCase();
  if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "audio.m4a";
  if (m.includes("mpeg") || m.includes("mp3")) return "audio.mp3";
  if (m.includes("wav")) return "audio.wav";
  if (m.includes("ogg")) return "audio.ogg";
  if (m.includes("webm")) return "audio.webm";
  return "audio.m4a";
}

/**
 * Czech clinical speech-to-text.
 * Prefers OpenAI Whisper for medical Czech quality, falls back to Groq large-v3.
 * Audio is never persisted — caller must discard the buffer after use.
 */
export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string,
  originalName?: string
): Promise<TranscribeResult> {
  const openAiKey = resolveOpenAiKey();
  const groqKey = resolveGroqKey();
  const errors: string[] = [];

  // Prefer OpenAI for Czech clinical quality; Groq as fast fallback.
  if (openAiKey) {
    try {
      return await transcribeWithOpenAi(buffer, mimeType, openAiKey, originalName);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  if (groqKey) {
    try {
      return await transcribeWithGroq(buffer, mimeType, groqKey, originalName);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  if (!groqKey && !openAiKey) {
    throw new Error(
      "Přepis řeči není nakonfigurován. Nastavte OPENAI_API_KEY (sk-…) nebo GROQ_API_KEY (gsk_…)."
    );
  }

  throw new Error(
    `Přepis řeči selhal. ${errors.join(" | ") || "Neznámá chyba STT."}`
  );
}
