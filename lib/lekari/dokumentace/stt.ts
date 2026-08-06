import { resolveOpenAiKey } from "@/lib/ai/openai-key";
import { resolveGroqKey } from "@/lib/ai/groq";

export type TranscribeResult = {
  text: string;
  provider: string;
};

async function transcribeWithOpenAi(
  buffer: Buffer,
  mimeType: string,
  apiKey: string
): Promise<TranscribeResult> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType || "audio/webm" });
  form.append("file", blob, guessFilename(mimeType));
  form.append("model", "whisper-1");
  form.append("language", "cs");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
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
  apiKey: string
): Promise<TranscribeResult> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType || "audio/webm" });
  form.append("file", blob, guessFilename(mimeType));
  form.append("model", "whisper-large-v3");
  form.append("language", "cs");
  form.append("response_format", "json");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
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

function guessFilename(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "audio.m4a";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "audio.mp3";
  if (mimeType.includes("wav")) return "audio.wav";
  if (mimeType.includes("ogg")) return "audio.ogg";
  return "audio.webm";
}

/**
 * Czech speech-to-text. Prefers OpenAI whisper-1, falls back to Groq whisper-large-v3.
 * Audio is never persisted — caller must discard the buffer after use.
 */
export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string
): Promise<TranscribeResult> {
  const openAiKey = resolveOpenAiKey();
  const groqKey = resolveGroqKey();
  const errors: string[] = [];

  // Prefer Groq in production (often configured); fall back to OpenAI.
  if (groqKey) {
    try {
      return await transcribeWithGroq(buffer, mimeType, groqKey);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  if (openAiKey) {
    try {
      return await transcribeWithOpenAi(buffer, mimeType, openAiKey);
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
