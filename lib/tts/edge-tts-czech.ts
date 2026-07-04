/**
 * Microsoft Edge TTS — native Czech neural voices (cs-CZ-VlastaNeural / AntoninNeural).
 * Server-side uses edge-tts-universal (handles Sec-MS-GEC / WebSocket headers).
 */

import { Communicate } from "edge-tts-universal";

export const CZECH_EDGE_VOICES = {
  female: "cs-CZ-VlastaNeural",
  male: "cs-CZ-AntoninNeural",
} as const;

export type CzechEdgeGender = keyof typeof CZECH_EDGE_VOICES;

function resolveEdgeVoice(gender: CzechEdgeGender = "female"): string {
  const env = process.env.EDGE_TTS_VOICE?.trim();
  if (env && env.startsWith("cs-CZ")) return env;
  return CZECH_EDGE_VOICES[gender];
}

/** Synthesize Czech speech via Microsoft Edge TTS neural voices. */
export async function synthesizeCzechEdgeTts(
  text: string,
  opts: { gender?: CzechEdgeGender; voice?: string; rate?: string } = {}
): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty text for Edge TTS");

  const voice = opts.voice ?? resolveEdgeVoice(opts.gender ?? "female");
  const rate = opts.rate ?? "-5%";

  const communicate = new Communicate(trimmed.slice(0, 4096), { voice, rate, pitch: "+0Hz" });
  const chunks: Buffer[] = [];

  for await (const chunk of communicate.stream()) {
    if (chunk.type === "audio" && chunk.data?.length) {
      chunks.push(Buffer.from(chunk.data));
    }
  }

  if (!chunks.length) throw new Error("Edge TTS returned no audio");
  return Buffer.concat(chunks);
}

export function isEdgeTtsAvailable(): boolean {
  return typeof process !== "undefined" && Boolean(process.versions?.node);
}
