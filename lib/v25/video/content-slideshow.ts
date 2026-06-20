/**
 * Topic-aligned slideshow pipeline (v25) — GROQ text-only, free.
 * Generates slide manifest matching lesson/article content (not generic placeholders).
 */
import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { SlideItem } from "@/lib/v25/video/slideshow-pipeline";

export type ContentSlideshowManifest = {
  title: string;
  topic: string;
  script: string;
  voiceoverText: string;
  slides: SlideItem[];
  alignmentScore: number;
  ttsMode: "web_speech_api";
  generatedAt: string;
  provider: "groq" | "static";
  model?: string;
};

export type ContentSlideshowInput = {
  lessonTitle: string;
  lessonBody: string;
  courseTopic?: string;
  articleSlug?: string;
};

const PLACEHOLDER_PATTERNS = [
  /w3schools\.com\/html\/mov_bbb/i,
  /gtv-videos-bucket/i,
  /sample-videos\.com/i,
];

export function isPlaceholderVideoUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(url));
}

const SLIDESHOW_SYSTEM = `Jsi medicínský lektor MedScope Academy. Vrať pouze JSON:
{
  "title": "název odpovídající lekci",
  "topic": "hlavní téma",
  "script": "celý mluvený komentář k tématu (cs)",
  "voiceoverText": "zkrácený text pro Web Speech API",
  "slides": [
    {"title": "...", "body": "2-3 věty k tématu", "imageDescription": "vizuální popis", "durationSeconds": 10}
  ],
  "alignmentScore": 0.0-1.0
}
Pravidla: 4–8 slidů, česky, obsah MUSÍ odpovídat titulku lekce a textu. Žádné generické ukázkové video.`;

export async function generateContentSlideshow(
  input: ContentSlideshowInput
): Promise<ContentSlideshowManifest | null> {
  const topic = input.courseTopic?.trim() || input.lessonTitle;
  const bodySnippet = input.lessonBody.replace(/[#*]/g, "").slice(0, 2500);
  const slugHint = input.articleSlug ? `\nČlánek/slug: ${input.articleSlug}` : "";

  if (!isGroqConfigured()) {
    return buildStaticSlideshow(input.lessonTitle, bodySnippet, topic);
  }

  const raw = await groqCompleteJson({
    system: SLIDESHOW_SYSTEM,
    user: `Kurz/téma: ${topic}${slugHint}\nLekce: ${input.lessonTitle}\n\nObsah lekce:\n${bodySnippet}`,
    maxTokens: 4096,
    temperature: 0.35,
  });

  if (!raw) return buildStaticSlideshow(input.lessonTitle, bodySnippet, topic);

  try {
    const parsed = JSON.parse(raw) as ContentSlideshowManifest & { slides?: SlideItem[] };
    if (!parsed.slides?.length) return buildStaticSlideshow(input.lessonTitle, bodySnippet, topic);

    return {
      title: parsed.title || input.lessonTitle,
      topic: parsed.topic || topic,
      script: parsed.script || parsed.voiceoverText || input.lessonTitle,
      voiceoverText: parsed.voiceoverText || parsed.script || input.lessonTitle,
      slides: parsed.slides.map((s) => ({
        title: s.title,
        body: s.body,
        imageDescription: s.imageDescription || s.title,
        durationSeconds: Math.max(6, Math.min(20, s.durationSeconds ?? 10)),
      })),
      alignmentScore: clampScore(parsed.alignmentScore),
      ttsMode: "web_speech_api",
      generatedAt: new Date().toISOString(),
      provider: "groq",
      model: resolveAiModel(),
    };
  } catch {
    return buildStaticSlideshow(input.lessonTitle, bodySnippet, topic);
  }
}

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : 0.85;
  return Math.max(0, Math.min(1, v));
}

function buildStaticSlideshow(
  title: string,
  body: string,
  topic: string
): ContentSlideshowManifest {
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15)
    .slice(0, 6);

  const slides: SlideItem[] =
    paragraphs.length > 0
      ? paragraphs.map((p, i) => ({
          title: i === 0 ? title : `${title} — část ${i + 1}`,
          body: p.slice(0, 280),
          imageDescription: topic,
          durationSeconds: 10,
        }))
      : [
          {
            title,
            body: `Tato lekce v kurzu „${topic}" pokrývá téma: ${title}.`,
            imageDescription: topic,
            durationSeconds: 10,
          },
        ];

  return {
    title,
    topic,
    script: slides.map((s) => `${s.title}. ${s.body}`).join(" "),
    voiceoverText: slides.map((s) => s.body).join(" "),
    slides,
    alignmentScore: 0.7,
    ttsMode: "web_speech_api",
    generatedAt: new Date().toISOString(),
    provider: "static",
  };
}

export function extractSlideshowManifest(
  contentJson: Record<string, unknown> | null | undefined,
  videoMeta: Record<string, unknown> | null | undefined
): ContentSlideshowManifest | null {
  const fromJson = contentJson?.slideshow as ContentSlideshowManifest | undefined;
  if (fromJson?.slides?.length) return fromJson;

  const fromMeta = videoMeta?.slideshow as ContentSlideshowManifest | undefined;
  if (fromMeta?.slides?.length) return fromMeta;

  const legacySlides = contentJson?.slides;
  if (Array.isArray(legacySlides) && legacySlides.length) {
    return {
      title: String(contentJson?.slideshow_title ?? "Lekce"),
      topic: String(contentJson?.topic ?? ""),
      script: String(contentJson?.voiceover_text ?? ""),
      voiceoverText: String(contentJson?.voiceover_text ?? ""),
      slides: legacySlides as SlideItem[],
      alignmentScore: Number(contentJson?.alignment_score ?? 0.8),
      ttsMode: "web_speech_api",
      generatedAt: String(contentJson?.slideshow_generated_at ?? new Date().toISOString()),
      provider: "static",
    };
  }

  return null;
}

export async function persistSlideshowToLesson(input: {
  lessonId: string;
  manifest: ContentSlideshowManifest;
  videoAssetId?: string | null;
}): Promise<boolean> {
  try {
    const admin = createServiceRoleClient();

    const { data: lesson } = await admin
      .from("lessons")
      .select("content_json")
      .eq("id", input.lessonId)
      .maybeSingle();

    const existing = (lesson?.content_json ?? {}) as Record<string, unknown>;

    await admin
      .from("lessons")
      .update({
        content_json: {
          ...existing,
          slideshow: input.manifest,
          slides: input.manifest.slides,
          voiceover_text: input.manifest.voiceoverText,
          alignment_score: input.manifest.alignmentScore,
          slideshow_generated_at: input.manifest.generatedAt,
          video_mode: "topic_slideshow",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.lessonId);

    if (input.videoAssetId) {
      const { data: asset } = await admin
        .from("video_assets")
        .select("metadata")
        .eq("id", input.videoAssetId)
        .maybeSingle();

      const meta = (asset?.metadata ?? {}) as Record<string, unknown>;
      await admin
        .from("video_assets")
        .update({
          metadata: {
            ...meta,
            slideshow: input.manifest,
            public_url: V33_FALLBACK_MP4_URL,
            mp4_url: V33_FALLBACK_MP4_URL,
            url_chain: [V33_FALLBACK_MP4_URL],
            render_status: "slideshow",
            generation_provider: input.manifest.provider,
            topic_aligned: true,
          },
          status: "ready",
        })
        .eq("id", input.videoAssetId);
    }

    return true;
  } catch (e) {
    console.error("[content-slideshow] persist failed:", e);
    return false;
  }
}

export function scoreTopicAlignment(
  lessonTitle: string,
  manifest: ContentSlideshowManifest | null
): number {
  if (!manifest?.slides?.length) return 0;
  const haystack = [
    manifest.title,
    manifest.topic,
    manifest.script,
    ...manifest.slides.map((s) => `${s.title} ${s.body}`),
  ]
    .join(" ")
    .toLowerCase();

  const tokens = lessonTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (!tokens.length) return manifest.alignmentScore ?? 0.5;

  const hits = tokens.filter((t) => haystack.includes(t)).length;
  const ratio = hits / tokens.length;
  return clampScore(Math.max(manifest.alignmentScore ?? 0, ratio));
}
