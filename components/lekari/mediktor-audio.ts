/** Client-only helpers for MeDiktor phone file upload. */

export const MEDIKTOR_FILE_ACCEPT =
  "audio/*,video/mp4,video/quicktime,.m4a,.mp3,.wav,.aac,.caf,.ogg,.webm,.mp4,.mpeg";

export function resolveAudioMeta(
  file: Blob & { name?: string },
  index = 0
): { mime: string; filename: string } {
  const name = (file.name || "").toLowerCase();
  let mime = (file.type || "").toLowerCase();

  if (!mime || mime === "application/octet-stream") {
    if (name.endsWith(".m4a") || name.endsWith(".mp4") || name.endsWith(".caf")) {
      mime = "audio/mp4";
    } else if (name.endsWith(".mp3") || name.endsWith(".mpeg")) {
      mime = "audio/mpeg";
    } else if (name.endsWith(".wav")) {
      mime = "audio/wav";
    } else if (name.endsWith(".aac")) {
      mime = "audio/aac";
    } else if (name.endsWith(".ogg") || name.endsWith(".oga")) {
      mime = "audio/ogg";
    } else if (name.endsWith(".webm")) {
      mime = "audio/webm";
    } else {
      mime = "audio/mp4"; // iOS Voice Memos default guess
    }
  }

  // Normalize iOS quirks
  if (mime === "audio/x-m4a" || mime === "audio/m4a") mime = "audio/mp4";
  if (mime === "video/mp4" || mime === "video/quicktime") mime = "audio/mp4";

  let ext = "m4a";
  if (mime.includes("wav")) ext = "wav";
  else if (mime.includes("mpeg") || mime.includes("mp3")) ext = "mp3";
  else if (mime.includes("aac")) ext = "aac";
  else if (mime.includes("ogg")) ext = "ogg";
  else if (mime.includes("webm")) ext = "webm";
  else if (mime.includes("mp4") || mime.includes("m4a")) ext = "m4a";

  const base =
    name && /\.[a-z0-9]+$/i.test(name)
      ? name.replace(/\.[^.]+$/, "")
      : `recording-${index}`;
  const safeBase = base.replace(/[^\w.-]+/g, "_").slice(0, 80) || `recording-${index}`;
  return { mime, filename: `${safeBase}.${ext}` };
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

/** Encode mono PCM WAV at given sample rate (keeps upload size predictable). */
export function encodeWavMono(buffer: AudioBuffer, sampleRate = 16000): Blob {
  const duration = buffer.duration;
  const length = Math.floor(duration * sampleRate);
  const mono = new Float32Array(length);
  const channels = buffer.numberOfChannels;
  const ratio = buffer.sampleRate / sampleRate;

  for (let i = 0; i < length; i++) {
    const srcIndex = Math.min(buffer.length - 1, Math.floor(i * ratio));
    let sum = 0;
    for (let c = 0; c < channels; c++) {
      sum += buffer.getChannelData(c)[srcIndex] || 0;
    }
    mono[i] = sum / channels;
  }

  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = mono.length * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < mono.length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export const MEDIKTOR_MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MEDIKTOR_UPLOAD_CHUNK_BYTES = 3_000_000;

/** Normalize a phone file for direct STT when it fits under the gateway soft limit. */
export function normalizePhoneFile(file: File): File {
  const { mime, filename } = resolveAudioMeta(file);
  if (file.type === mime && file.name === filename) return file;
  return new File([file], filename, { type: mime });
}

export type PhoneFileProcessResult = {
  transcript: string;
  note: string;
  provider?: string;
  remaining?: number;
  saved?: boolean;
  noteId?: string | null;
};

/**
 * Upload a phone recording in binary chunks (no browser decode), then process on server.
 * Use when the file exceeds the Vercel/gateway soft limit — iOS m4a often cannot be decoded in Safari.
 */
export async function uploadAndProcessPhoneFile(opts: {
  file: File;
  mode: string;
  templateId: string;
  specialty?: string;
  source?: string;
  onProgress?: (ratio: number, label: string) => void;
}): Promise<PhoneFileProcessResult> {
  const { file, mode, templateId, specialty, source } = opts;
  if (file.size <= 0) {
    throw new Error("Soubor je prázdný.");
  }
  if (file.size > MEDIKTOR_MAX_FILE_BYTES) {
    throw new Error(
      "Soubor je větší než 25 MB. Nahrajte kratší nahrávku nebo použijte Nahrávat v MeDiktoru."
    );
  }

  const { mime, filename } = resolveAudioMeta(file);
  opts.onProgress?.(0.02, "Připravuji nahrávku…");

  const sessionRes = await fetch("/api/lekari/dokumentace/file-session", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      byteLength: file.size,
      filename,
      mimeType: mime,
    }),
  });
  const sessionJson = (await sessionRes.json().catch(() => ({}))) as {
    error?: string;
    sessionId?: string;
    maxChunkBytes?: number;
  };
  if (!sessionRes.ok || !sessionJson.sessionId) {
    throw new Error(sessionJson.error || "Nepodařilo se zahájit nahrání souboru.");
  }

  const chunkSize = Math.min(
    sessionJson.maxChunkBytes || MEDIKTOR_UPLOAD_CHUNK_BYTES,
    MEDIKTOR_UPLOAD_CHUNK_BYTES
  );
  const total = Math.max(1, Math.ceil(file.size / chunkSize));

  for (let i = 0; i < total; i++) {
    const start = i * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const slice = file.slice(start, end);
    const form = new FormData();
    form.append("sessionId", sessionJson.sessionId);
    form.append("index", String(i));
    form.append("total", String(total));
    form.append("chunk", slice, `${filename}.part${i}`);

    const chunkRes = await fetch("/api/lekari/dokumentace/file-chunk", {
      method: "POST",
      credentials: "same-origin",
      body: form,
    });
    const chunkJson = (await chunkRes.json().catch(() => ({}))) as { error?: string };
    if (!chunkRes.ok) {
      throw new Error(chunkJson.error || `Odeslání části ${i + 1}/${total} selhalo.`);
    }
    opts.onProgress?.(0.05 + (0.55 * (i + 1)) / total, `Odesílám ${i + 1}/${total}…`);
  }

  opts.onProgress?.(0.65, "Přepisuji nahrávku…");
  const processRes = await fetch("/api/lekari/dokumentace/process-file", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "x-dokumentace-source": source || "mobile-file",
    },
    body: JSON.stringify({
      sessionId: sessionJson.sessionId,
      total,
      filename,
      mimeType: mime,
      mode,
      templateId,
      specialty: specialty || undefined,
      source: source || "mobile-file",
    }),
  });
  const processJson = (await processRes.json().catch(() => ({}))) as PhoneFileProcessResult & {
    error?: string;
  };
  if (!processRes.ok) {
    throw new Error(processJson.error || "Zpracování souboru selhalo.");
  }
  if (!(processJson.note ?? "").trim()) {
    throw new Error("Zápis se nepodařilo sestavit ze souboru.");
  }
  opts.onProgress?.(1, "Hotovo");
  return {
    transcript: processJson.transcript ?? "",
    note: processJson.note ?? "",
    provider: processJson.provider,
    remaining: processJson.remaining,
    saved: processJson.saved,
    noteId: processJson.noteId,
  };
}

/**
 * @deprecated Prefer normalizePhoneFile + uploadAndProcessPhoneFile for phone files.
 * Kept for small in-app blobs only.
 */
export async function prepareUploadBlobs(
  file: File,
  softLimitBytes: number
): Promise<{ blobs: Blob[]; warning?: string }> {
  if (file.size > 0 && file.size <= softLimitBytes) {
    return { blobs: [normalizePhoneFile(file)] };
  }
  // Large phone files must not rely on browser decode (iOS Voice Memos often fails).
  throw new Error(
    "Soubor je příliš velký pro přímé odeslání — použijte nahrání přes MeDiktor (automatické dělení)."
  );
}
