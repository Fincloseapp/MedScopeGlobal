export type VideoDurationResult = {
  duration_seconds: number | null;
  source: "mp4-mvhd" | "estimated" | "unknown";
};

/** Lightweight MP4 `mvhd` scan — returns null when not parseable. */
function readMp4DurationSeconds(buffer: Buffer): number | null {
  const len = buffer.length;
  let offset = 0;

  while (offset + 8 <= len) {
    const boxSize = buffer.readUInt32BE(offset);
    const boxType = buffer.toString("ascii", offset + 4, offset + 8);
    if (boxSize < 8) break;

    if (boxType === "moov" || boxType === "trak" || boxType === "mdia" || boxType === "minf") {
      offset += 8;
      continue;
    }

    if (boxType === "mvhd" && boxSize >= 32) {
      const version = buffer.readUInt8(offset + 8);
      if (version === 0 && boxSize >= 28) {
        const timescale = buffer.readUInt32BE(offset + 20);
        const duration = buffer.readUInt32BE(offset + 24);
        if (timescale > 0 && duration > 0) {
          return Math.round(duration / timescale);
        }
      }
      if (version === 1 && boxSize >= 44) {
        const timescale = buffer.readUInt32BE(offset + 28);
        const durationHi = buffer.readUInt32BE(offset + 32);
        const durationLo = buffer.readUInt32BE(offset + 36);
        const duration = durationHi * 2 ** 32 + durationLo;
        if (timescale > 0 && duration > 0) {
          return Math.round(duration / timescale);
        }
      }
      return null;
    }

    offset += boxSize;
  }

  return null;
}

/** Estimates duration from file size (~1.5 Mbps average video bitrate). */
function estimateDurationFromSize(sizeBytes: number): number {
  const bits = sizeBytes * 8;
  const seconds = bits / 1_500_000;
  return Math.max(1, Math.round(seconds));
}

/**
 * Extracts or estimates video duration for Academy uploads.
 * Full transcoding pipeline is deferred to Phase 8.
 */
export function extractVideoDuration(
  buffer: Buffer,
  contentType: string,
  sizeBytes: number
): VideoDurationResult {
  const isMp4 =
    contentType.includes("mp4") ||
    contentType.includes("quicktime") ||
    buffer.slice(4, 8).toString("ascii") === "ftyp";

  if (isMp4) {
    const parsed = readMp4DurationSeconds(buffer);
    if (parsed && parsed > 0) {
      return { duration_seconds: parsed, source: "mp4-mvhd" };
    }
  }

  if (sizeBytes > 0) {
    return {
      duration_seconds: estimateDurationFromSize(sizeBytes),
      source: "estimated",
    };
  }

  return { duration_seconds: null, source: "unknown" };
}
