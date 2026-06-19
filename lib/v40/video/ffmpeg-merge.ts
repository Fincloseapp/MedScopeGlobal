/**
 * Merge video + audio via ffmpeg CLI.
 * ffmpeg is NOT available on Vercel serverless by default — use audio-only lessons in prod
 * or run merge on a dedicated worker with FFMPEG_PATH set.
 */

import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { localDataPath } from "@/lib/config/paths";

export type FfmpegMergeResult =
  | { ok: true; outputPath: string }
  | { ok: false; reason: "ffmpeg_unavailable" | "merge_failed"; message: string };

export function isFfmpegAvailable(): boolean {
  if (process.env.VERCEL === "1" && !process.env.FFMPEG_PATH) {
    return false;
  }
  return Boolean(process.env.FFMPEG_PATH?.trim() || process.env.FFMPEG_AVAILABLE === "1");
}

function ffmpegBin(): string {
  return process.env.FFMPEG_PATH?.trim() || "ffmpeg";
}

export async function generateVideoWithAudio(
  videoPath: string,
  audioBuffer: Buffer
): Promise<FfmpegMergeResult> {
  if (!isFfmpegAvailable()) {
    return {
      ok: false,
      reason: "ffmpeg_unavailable",
      message:
        "ffmpeg not available on this runtime (Vercel serverless) — audio-only lesson or external render worker required",
    };
  }

  const workDir = localDataPath("v40", "ffmpeg-merge", String(Date.now()));
  await mkdir(workDir, { recursive: true });
  const audioPath = join(workDir, "narration.mp3");
  const output = join(workDir, `output-${Date.now()}.mp4`);

  await writeFile(audioPath, audioBuffer);

  try {
    await access(videoPath);
  } catch {
    return { ok: false, reason: "merge_failed", message: "Video source file not found" };
  }

  return new Promise((resolve) => {
    const args = [
      "-y",
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-map",
      "0:v",
      "-map",
      "1:a",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-shortest",
      output,
    ];

    const proc = spawn(ffmpegBin(), args, { stdio: "pipe" });
    let stderr = "";

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("error", (err) => {
      resolve({ ok: false, reason: "merge_failed", message: err.message });
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true, outputPath: output });
      } else {
        resolve({
          ok: false,
          reason: "merge_failed",
          message: stderr.slice(-300) || `ffmpeg exited ${code}`,
        });
      }
    });
  });
}
