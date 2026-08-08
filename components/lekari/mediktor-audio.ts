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

/**
 * Prepare phone recordings for upload under gateway size limits.
 * Small files go through as-is; larger ones are decoded and split into ~90s WAV chunks.
 */
export async function prepareUploadBlobs(
  file: File,
  softLimitBytes: number
): Promise<{ blobs: Blob[]; warning?: string }> {
  if (file.size > 0 && file.size <= softLimitBytes) {
    const { mime } = resolveAudioMeta(file);
    const blob =
      file.type && file.type === mime
        ? file
        : new File([file], resolveAudioMeta(file).filename, { type: mime });
    return { blobs: [blob] };
  }

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error(
      "Tento prohlížeč neumí zpracovat velký audio soubor. Použijte kratší nahrávku nebo tlačítko Nahrávat v aplikaci."
    );
  }

  const ctx = new AudioCtx();
  try {
    const raw = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(raw.slice(0));
    const chunkSec = 90;
    const blobs: Blob[] = [];
    let start = 0;
    let index = 0;
    while (start < audioBuffer.duration) {
      const end = Math.min(audioBuffer.duration, start + chunkSec);
      const frameCount = Math.max(1, Math.ceil((end - start) * audioBuffer.sampleRate));
      const slice = ctx.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        audioBuffer.sampleRate
      );
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const src = audioBuffer.getChannelData(c);
        const dst = slice.getChannelData(c);
        const from = Math.floor(start * audioBuffer.sampleRate);
        dst.set(src.subarray(from, from + frameCount));
      }
      const wav = encodeWavMono(slice, 16000);
      if (wav.size > softLimitBytes) {
        // Fallback shorter chunk
        const shorter = ctx.createBuffer(
          slice.numberOfChannels,
          Math.floor(slice.length / 2),
          slice.sampleRate
        );
        for (let c = 0; c < slice.numberOfChannels; c++) {
          shorter.getChannelData(c).set(slice.getChannelData(c).subarray(0, shorter.length));
        }
        blobs.push(encodeWavMono(shorter, 16000));
        start += chunkSec / 2;
      } else {
        blobs.push(wav);
        start = end;
      }
      index += 1;
      if (index > 80) break; // safety: ~2h
    }
    if (blobs.length === 0) {
      throw new Error("Soubor se nepodařilo rozdělit na odesílatelné části.");
    }
    return {
      blobs,
      warning:
        file.size > softLimitBytes
          ? `Soubor byl rozdělen na ${blobs.length} částí kvůli limitu odeslání.`
          : undefined,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/decode|EncodingError|Unable to decode/i.test(msg)) {
      throw new Error(
        "Formát nahrávky telefon neumí převést v prohlížeči. Uložte jako M4A/MP3, nebo použijte Nahrávat přímo v MeDiktoru."
      );
    }
    throw e instanceof Error ? e : new Error(msg);
  } finally {
    void ctx.close();
  }
}
