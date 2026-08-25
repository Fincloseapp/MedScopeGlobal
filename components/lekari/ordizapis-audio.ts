/** Client-only helpers for OrdiZapis phone file upload. */

export const ORDIZAPIS_FILE_ACCEPT =
  "audio/*,video/mp4,video/quicktime,.m4a,.mp3,.wav,.aac,.caf,.ogg,.webm,.mp4,.mpeg";

export const ORDIZAPIS_MAX_FILE_BYTES = 25 * 1024 * 1024;
export const ORDIZAPIS_UPLOAD_CHUNK_BYTES = 2_000_000;

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
      mime = "audio/mp4";
    }
  }

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

/** Normalize a phone file for direct STT when it fits under the gateway soft limit. */
export function normalizePhoneFile(file: File): File {
  const { mime, filename } = resolveAudioMeta(file);
  if (file.type === mime && file.name === filename) return file;
  return new File([file], filename, { type: mime });
}

export function isFetchNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /failed to fetch|networkerror|load failed|abort|timed out|timeout/i.test(msg);
}

export function friendlyFetchError(err: unknown, fallback: string): string {
  if (isFetchNetworkError(err)) {
    return (
      "Spojení při odesílání nahrávky selhalo (časté u většího M4A na mobilu). " +
      "Zkuste znovu na Wi‑Fi, nebo použijte Nahrávat přímo v OrdiZapisu."
    );
  }
  const msg = err instanceof Error ? err.message : String(err);
  return msg.trim() || fallback;
}

async function sleep(ms: number) {
  await new Promise((r) => window.setTimeout(r, ms));
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  tries = 3
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(input, init);
      // Retry transient gateway / overload
      if ((res.status === 502 || res.status === 503 || res.status === 429) && attempt < tries) {
        await sleep(400 * attempt);
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt >= tries) break;
      await sleep(500 * attempt);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Failed to fetch");
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  const raw = await res.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { error: raw.slice(0, 180) };
  }
}

export type PhoneTranscribeResult = {
  transcript: string;
  provider?: string;
};

async function uploadViaSignedUrl(
  file: File,
  mime: string,
  filename: string,
  onProgress?: (ratio: number, label: string) => void
): Promise<string | null> {
  onProgress?.(0.05, "Připravuji bezpečný upload…");
  const intentRes = await fetchWithRetry("/api/lekari/dokumentace/file-upload-url", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      byteLength: file.size,
      filename,
      mimeType: mime,
    }),
  });
  const intent = await readJson(intentRes);
  if (!intentRes.ok) {
    // Caller will fall back to chunked upload
    return null;
  }

  const path = typeof intent.path === "string" ? intent.path : "";
  const token = typeof intent.token === "string" ? intent.token : "";
  const signedUrl = typeof intent.signedUrl === "string" ? intent.signedUrl : "";
  if (!path || (!token && !signedUrl)) return null;

  onProgress?.(0.15, "Odesílám soubor…");

  // Official Supabase signed upload (FormData PUT) — most reliable on mobile
  if (token) {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("media")
        .uploadToSignedUrl(path, token, file, { contentType: mime, upsert: true });
      if (!error) {
        onProgress?.(0.55, "Soubor nahrán…");
        return path;
      }
    } catch {
      // fall through to raw signedUrl / chunked
    }
  }

  if (signedUrl) {
    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);
    const putRes = await fetchWithRetry(
      signedUrl,
      {
        method: "PUT",
        headers: { "x-upsert": "true" },
        body: form,
      },
      2
    );
    if (putRes.ok) {
      onProgress?.(0.55, "Soubor nahrán…");
      return path;
    }
  }

  return null;
}

async function uploadViaChunks(
  file: File,
  mime: string,
  filename: string,
  onProgress?: (ratio: number, label: string) => void
): Promise<{ sessionId: string; total: number }> {
  onProgress?.(0.05, "Připravuji nahrávku po částech…");
  const sessionRes = await fetchWithRetry("/api/lekari/dokumentace/file-session", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      byteLength: file.size,
      filename,
      mimeType: mime,
    }),
  });
  const sessionJson = await readJson(sessionRes);
  const sessionId = typeof sessionJson.sessionId === "string" ? sessionJson.sessionId : "";
  if (!sessionRes.ok || !sessionId) {
    throw new Error(
      (typeof sessionJson.error === "string" && sessionJson.error) ||
        "Nepodařilo se zahájit nahrání souboru."
    );
  }

  const chunkSize = Math.min(
    Number(sessionJson.maxChunkBytes) || ORDIZAPIS_UPLOAD_CHUNK_BYTES,
    ORDIZAPIS_UPLOAD_CHUNK_BYTES
  );
  const total = Math.max(1, Math.ceil(file.size / chunkSize));

  for (let i = 0; i < total; i++) {
    const start = i * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const slice = file.slice(start, end);
    const form = new FormData();
    form.append("sessionId", sessionId);
    form.append("index", String(i));
    form.append("total", String(total));
    form.append("chunk", slice, `${filename}.part${i}`);

    const chunkRes = await fetchWithRetry(
      "/api/lekari/dokumentace/file-chunk",
      {
        method: "POST",
        credentials: "same-origin",
        body: form,
      },
      3
    );
    const chunkJson = await readJson(chunkRes);
    if (!chunkRes.ok) {
      throw new Error(
        (typeof chunkJson.error === "string" && chunkJson.error) ||
          `Odeslání části ${i + 1}/${total} selhalo.`
      );
    }
    onProgress?.(0.1 + (0.45 * (i + 1)) / total, `Odesílám ${i + 1}/${total}…`);
  }

  return { sessionId, total };
}

/**
 * Upload a phone recording (no browser decode) and return STT transcript.
 * Structure/note assembly is done by the caller via /structure.
 */
export async function uploadAndTranscribePhoneFile(opts: {
  file: File;
  onProgress?: (ratio: number, label: string) => void;
}): Promise<PhoneTranscribeResult> {
  const { file } = opts;
  if (file.size <= 0) throw new Error("Soubor je prázdný.");
  if (file.size > ORDIZAPIS_MAX_FILE_BYTES) {
    throw new Error(
      "Soubor je větší než 25 MB. Nahrajte kratší nahrávku nebo použijte Nahrávat v OrdiZapisu."
    );
  }

  const { mime, filename } = resolveAudioMeta(file);

  let path: string | null = null;
  let session: { sessionId: string; total: number } | null = null;

  try {
    path = await uploadViaSignedUrl(file, mime, filename, opts.onProgress);
  } catch {
    path = null;
  }

  if (!path) {
    session = await uploadViaChunks(file, mime, filename, opts.onProgress);
  }

  opts.onProgress?.(0.65, "Přepisuji nahrávku…");
  const processRes = await fetchWithRetry(
    "/api/lekari/dokumentace/process-file",
    {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        path
          ? { path, filename, mimeType: mime }
          : {
              sessionId: session!.sessionId,
              total: session!.total,
              filename,
              mimeType: mime,
            }
      ),
    },
    2
  );
  const processJson = await readJson(processRes);
  if (!processRes.ok) {
    throw new Error(
      (typeof processJson.error === "string" && processJson.error) ||
        "Přepis souboru selhal."
    );
  }
  const transcript =
    typeof processJson.transcript === "string" ? processJson.transcript.trim() : "";
  if (!transcript) {
    throw new Error("Přepis je prázdný — soubor se nepodařilo rozpoznat.");
  }
  opts.onProgress?.(0.9, "Přepis hotov…");
  return {
    transcript,
    provider: typeof processJson.provider === "string" ? processJson.provider : undefined,
  };
}

/** @deprecated */
export async function uploadAndProcessPhoneFile(opts: {
  file: File;
  mode: string;
  templateId: string;
  specialty?: string;
  source?: string;
  onProgress?: (ratio: number, label: string) => void;
}): Promise<{
  transcript: string;
  note: string;
  provider?: string;
  remaining?: number;
  saved?: boolean;
  noteId?: string | null;
}> {
  const stt = await uploadAndTranscribePhoneFile({
    file: opts.file,
    onProgress: opts.onProgress,
  });
  const structRes = await fetchWithRetry("/api/lekari/dokumentace/structure", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "x-dokumentace-source": opts.source || "mobile-file",
    },
    body: JSON.stringify({
      transcript: stt.transcript,
      mode: opts.mode,
      templateId: opts.templateId,
      specialty: opts.specialty || undefined,
      source: opts.source || "mobile-file",
    }),
  });
  const structJson = await readJson(structRes);
  if (!structRes.ok) {
    throw new Error(
      (typeof structJson.error === "string" && structJson.error) ||
        "Sestavení zápisu selhalo."
    );
  }
  const note = typeof structJson.note === "string" ? structJson.note : "";
  if (!note.trim()) throw new Error("Zápis se nepodařilo sestavit ze souboru.");
  return {
    transcript: stt.transcript,
    note,
    provider: stt.provider,
    remaining:
      typeof structJson.remaining === "number" ? structJson.remaining : undefined,
    saved: Boolean(structJson.saved),
    noteId: typeof structJson.noteId === "string" ? structJson.noteId : null,
  };
}

/** @deprecated */
export async function prepareUploadBlobs(
  file: File,
  softLimitBytes: number
): Promise<{ blobs: Blob[]; warning?: string }> {
  if (file.size > 0 && file.size <= softLimitBytes) {
    return { blobs: [normalizePhoneFile(file)] };
  }
  throw new Error(
    "Soubor je příliš velký pro přímé odeslání — použijte nahrání přes OrdiZapis (automatické dělení)."
  );
}
