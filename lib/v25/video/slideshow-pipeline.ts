/**
 * Free slideshow video pipeline (v25).
 * GROQ generates script + slides (text only). MP4 merge via FFmpeg when available;
 * otherwise static fallback MP4 + slide JSON overlay for client playback.
 */
import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { localDataPath, assertNotOnCDrive } from "@/lib/config/paths";

const execFileAsync = promisify(execFile);

export type SlideItem = {
  title: string;
  body: string;
  imageDescription: string;
  durationSeconds: number;
};

export type SlideshowPlan = {
  title: string;
  script: string;
  voiceoverText: string;
  slides: SlideItem[];
};

export type SlideshowResult = {
  ok: boolean;
  provider: "groq" | "fallback";
  model?: string;
  plan?: SlideshowPlan;
  videoUrl: string;
  slidesJsonUrl?: string | null;
  storagePath?: string | null;
  mode: "mp4" | "slides_overlay" | "fallback_mp4";
  message?: string;
};

const SLIDESHOW_SYSTEM = `Jsi medicínský video scenárista. Vrať pouze JSON:
{
  "title": "...",
  "script": "celý mluvený text",
  "voiceoverText": "text pro hlasový komentář",
  "slides": [
    {"title": "...", "body": "...", "imageDescription": "popis vizuálu (text)", "durationSeconds": 8}
  ]
}
Bez obrázků — pouze text. Česky. 4–8 slidů.`;

export async function generateSlideshowPlan(topic: string): Promise<SlideshowPlan | null> {
  if (!isGroqConfigured()) return null;

  const raw = await groqCompleteJson({
    system: SLIDESHOW_SYSTEM,
    user: `Téma lekce: ${topic}`,
    maxTokens: 4096,
    temperature: 0.35,
  });

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SlideshowPlan;
    if (!parsed.slides?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function resolveFfmpegPath(): string | null {
  const envPath = process.env.FFMPEG_PATH?.trim();
  if (envPath && fs.existsSync(envPath)) return envPath;
  return null;
}

/** Render simple colored slide PNGs via minimal SVG→would need canvas; use HTML slide manifest instead on Vercel. */
export function buildSlidesManifest(plan: SlideshowPlan) {
  return {
    title: plan.title,
    script: plan.script,
    voiceoverText: plan.voiceoverText,
    slides: plan.slides,
    fallbackVideoUrl: V33_FALLBACK_MP4_URL,
    ttsMode: "web_speech_api" as const,
    generatedAt: new Date().toISOString(),
  };
}

async function tryFfmpegMerge(slidesDir: string, outputPath: string): Promise<boolean> {
  const ffmpeg = resolveFfmpegPath();
  if (!ffmpeg) return false;

  const listFile = path.join(slidesDir, "concat.txt");
  const files = fs.readdirSync(slidesDir).filter((f) => f.endsWith(".png"));
  if (!files.length) return false;

  const lines = files.map((f) => `file '${path.join(slidesDir, f).replace(/\\/g, "/")}'\nduration 5`).join("\n");
  fs.writeFileSync(listFile, lines);

  try {
    await execFileAsync(ffmpeg, ["-f", "concat", "-safe", "0", "-i", listFile, "-c:v", "libx264", "-pix_fmt", "yuv420p", outputPath], {
      timeout: 120_000,
    });
    return fs.existsSync(outputPath);
  } catch {
    return false;
  }
}

async function uploadToSupabaseStorage(
  bucket: string,
  objectPath: string,
  body: Buffer | string,
  contentType: string
): Promise<string | null> {
  try {
    const admin = createServiceRoleClient();
    const data = typeof body === "string" ? Buffer.from(body, "utf8") : body;
    const { error } = await admin.storage.from(bucket).upload(objectPath, data, {
      contentType,
      upsert: true,
    });
    if (error) {
      console.warn("[slideshow] storage upload failed:", error.message);
      return null;
    }
    const { data: pub } = admin.storage.from(bucket).getPublicUrl(objectPath);
    return pub.publicUrl;
  } catch (e) {
    console.warn("[slideshow] storage error:", e);
    return null;
  }
}

export async function runSlideshowPipeline(input: {
  topic: string;
  lessonId?: string;
}): Promise<SlideshowResult> {
  const plan = await generateSlideshowPlan(input.topic);

  if (!plan) {
    return {
      ok: true,
      provider: "fallback",
      videoUrl: V33_FALLBACK_MP4_URL,
      mode: "fallback_mp4",
      message: "GROQ unavailable — w3schools fallback MP4",
    };
  }

  const manifest = buildSlidesManifest(plan);
  const bucket = process.env.SUPABASE_VIDEO_BUCKET?.trim() || "academy-videos";
  const stamp = Date.now();
  const basePath = `slideshow/${stamp}`;
  const manifestPath = `${basePath}/slides.json`;

  const slidesJsonUrl = await uploadToSupabaseStorage(
    bucket,
    manifestPath,
    JSON.stringify(manifest, null, 2),
    "application/json"
  );

  const ffmpeg = resolveFfmpegPath();
  let videoUrl = V33_FALLBACK_MP4_URL;
  let mode: SlideshowResult["mode"] = slidesJsonUrl ? "slides_overlay" : "fallback_mp4";

  if (ffmpeg) {
    const tmpDir = localDataPath("slideshow-tmp", String(stamp));
    assertNotOnCDrive(tmpDir, "slideshow-tmp");
    fs.mkdirSync(tmpDir, { recursive: true });
    const outMp4 = path.join(tmpDir, "output.mp4");
    const merged = await tryFfmpegMerge(tmpDir, outMp4);
    if (merged) {
      const mp4Url = await uploadToSupabaseStorage(
        bucket,
        `${basePath}/lesson.mp4`,
        fs.readFileSync(outMp4),
        "video/mp4"
      );
      if (mp4Url) {
        videoUrl = mp4Url;
        mode = "mp4";
      }
    }
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }

  if (input.lessonId && slidesJsonUrl) {
    try {
      const admin = createServiceRoleClient();
      await admin
        .from("lessons")
        .update({
          content_json: {
            slideshow_manifest_url: slidesJsonUrl,
            voiceover_text: plan.voiceoverText,
            video_mode: mode,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.lessonId);
    } catch {
      /* ignore */
    }
  }

  return {
    ok: true,
    provider: "groq",
    model: resolveAiModel(),
    plan,
    videoUrl,
    slidesJsonUrl,
    storagePath: manifestPath,
    mode,
    message:
      mode === "mp4"
        ? "FFmpeg MP4 uploaded to Supabase"
        : "Slides JSON + fallback MP4 — use Web Speech voiceover on client",
  };
}
