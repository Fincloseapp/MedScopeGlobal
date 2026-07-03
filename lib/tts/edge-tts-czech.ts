/**
 * Microsoft Edge TTS — native Czech neural voices (cs-CZ-VlastaNeural / AntoninNeural).
 * Server-side only; no API key required.
 */

import { randomUUID } from "crypto";

const EDGE_SPEECH_URL =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
const EDGE_API_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_VERSION = "131.0.6778.86";

export const CZECH_EDGE_VOICES = {
  female: "cs-CZ-VlastaNeural",
  male: "cs-CZ-AntoninNeural",
} as const;

export type CzechEdgeGender = keyof typeof CZECH_EDGE_VOICES;

const WIN_EPOCH_OFFSET = 11644473600;
const S_TO_NS = 1_000_000_000;

async function generateSecMsGec(): Promise<string> {
  let ticks = Math.floor(Date.now() / 1000);
  ticks += WIN_EPOCH_OFFSET;
  ticks -= ticks % 300;
  ticks *= S_TO_NS / 100;
  const strToHash = `${ticks.toFixed(0)}${EDGE_API_TOKEN}`;
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(strToHash));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSsml(text: string, voice: string, rate = "-5%"): string {
  const safe = escapeXml(text.slice(0, 4096));
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="cs-CZ"><voice name="${voice}"><prosody rate="${rate}" pitch="+0Hz">${safe}</prosody></voice></speak>`;
}

function genFrame(headers: Record<string, string>, body: string): string {
  let header = "";
  for (const [k, v] of Object.entries(headers)) header += `${k}: ${v}\r\n`;
  return `${header}\r\n${body}`;
}

function parseMessage(raw: string): { headers: Record<string, string>; body: string } {
  const lines = raw.split("\n");
  const headers: Record<string, string> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) break;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    headers[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  const body = lines.slice(i + 1).join("\n");
  return { headers, body };
}

function resolveEdgeVoice(gender: CzechEdgeGender = "female"): string {
  const env = process.env.EDGE_TTS_VOICE?.trim();
  if (env && env.startsWith("cs-CZ")) return env;
  return CZECH_EDGE_VOICES[gender];
}

type WebSocketLike = {
  addEventListener(type: string, listener: (event: MessageEvent) => void): void;
  send(data: string): void;
  close(): void;
};

async function openEdgeWebSocket(url: string, headers: Record<string, string>): Promise<WebSocketLike> {
  if (typeof WebSocket !== "undefined") {
    return new WebSocket(url) as unknown as WebSocketLike;
  }
  throw new Error("WebSocket unavailable — Edge TTS requires Node 20+ with global WebSocket");
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
  const connectId = randomUUID().replace(/-/g, "");
  const params = new URLSearchParams({
    ConnectionId: connectId,
    TrustedClientToken: EDGE_API_TOKEN,
    "Sec-MS-GEC": await generateSecMsGec(),
    "Sec-MS-GEC-Version": `1-${CHROMIUM_VERSION}`,
  });
  const url = `${EDGE_SPEECH_URL}?${params.toString()}`;
  const date = new Date().toUTCString();
  const major = CHROMIUM_VERSION.split(".")[0]!;

  const ws = await openEdgeWebSocket(url, {
    "User-Agent":
      `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ` +
      `(KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36 Edg/${major}.0.0.0`,
    Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    "Accept-Language": "cs-CZ,cs;q=0.9",
  });

  const config = genFrame(
    { "Content-Type": "application/json; charset=utf-8", Path: "speech.config", "X-Timestamp": date },
    JSON.stringify({
      context: {
        synthesis: {
          audio: {
            metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
            outputFormat: "audio-24khz-48kbitrate-mono-mp3",
          },
        },
      },
    })
  );

  const ssml = buildSsml(trimmed, voice, rate);
  const content = genFrame(
    {
      "Content-Type": "application/ssml+xml",
      Path: "ssml",
      "X-RequestId": connectId,
      "X-Timestamp": date,
    },
    ssml
  );

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Edge TTS timeout"));
    }, 120_000);

    ws.addEventListener("open", () => {
      ws.send(config);
      ws.send(content);
    });

    ws.addEventListener("message", (event: MessageEvent) => {
      const data = event.data;
      if (typeof data === "string") {
        const { headers } = parseMessage(data);
        if (headers["Path"] === "turn.end") {
          clearTimeout(timeout);
          ws.close();
          if (!chunks.length) reject(new Error("Edge TTS returned no audio"));
          else resolve(Buffer.concat(chunks));
        }
        return;
      }
      const buf = Buffer.from(data as ArrayBuffer);
      if (buf.length < 3) return;
      const headerLen = buf.readInt16BE(0);
      if (buf.length > headerLen + 2) chunks.push(buf.subarray(2 + headerLen));
    });

    ws.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error("Edge TTS WebSocket error"));
    });
  });
}

export function isEdgeTtsAvailable(): boolean {
  return typeof WebSocket !== "undefined" || process.versions.node >= "20";
}
