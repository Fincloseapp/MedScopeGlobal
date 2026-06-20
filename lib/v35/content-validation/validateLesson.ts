import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export type LessonValidationResult = {
  ok: boolean;
  content_mismatch: boolean;
  confidence: number;
  reason: string;
  flags: string[];
};

const MISMATCH_KEYWORDS = [
  ["matematika", "biologie", "fyziologie", "anatomie"],
  ["přijímačky", "chirurgie", "onkologie"],
];

function ruleBasedValidation(lessonTitle: string, videoTitle: string): LessonValidationResult {
  const lt = lessonTitle.toLowerCase();
  const vt = (videoTitle || lessonTitle).toLowerCase();
  const flags: string[] = [];

  if (!vt || vt === "untitled") {
    flags.push("missing_video_title");
  }

  const titleOverlap = lt.split(/\s+/).filter((w) => w.length > 3 && vt.includes(w));
  if (titleOverlap.length === 0 && lt.length > 5 && vt.length > 5) {
    flags.push("title_divergence");
  }

  for (const group of MISMATCH_KEYWORDS) {
    const lessonHit = group.find((k) => lt.includes(k));
    const videoHit = group.find((k) => vt.includes(k));
    if (lessonHit && videoHit && lessonHit !== videoHit) {
      flags.push(`topic_mismatch:${lessonHit}≠${videoHit}`);
    }
  }

  const content_mismatch = flags.some((f) => f.startsWith("topic_mismatch") || f === "title_divergence");

  return {
    ok: !content_mismatch,
    content_mismatch,
    confidence: content_mismatch ? 0.75 : 0.9,
    reason: content_mismatch
      ? "Název lekce a video téma se výrazně liší."
      : "Obsah lekce a video jsou v souladu.",
    flags,
  };
}

const SLIDESHOW_ALIGNMENT_THRESHOLD = 0.65;

function slideshowAlignedResult(alignmentScore: number): LessonValidationResult {
  return {
    ok: true,
    content_mismatch: false,
    confidence: alignmentScore,
    reason: "Slideshow odpovídá tématu lekce.",
    flags: ["topic_slideshow_aligned"],
  };
}

export async function validateLessonContent(input: {
  lessonTitle: string;
  lessonContent: string;
  videoTitle?: string;
  videoDescription?: string;
  slideshowTopic?: string;
  alignmentScore?: number;
}): Promise<LessonValidationResult> {
  const alignmentScore = input.alignmentScore ?? 0;
  if (alignmentScore >= SLIDESHOW_ALIGNMENT_THRESHOLD) {
    return slideshowAlignedResult(alignmentScore);
  }

  const rule = ruleBasedValidation(input.lessonTitle, input.videoTitle ?? input.lessonTitle);

  if (!isLlmConfigured()) return rule;

  try {
    const text = await generateTextFromLlm({
      system:
        "Jsi kontrolor obsahu MedScope Academy. Odpověz pouze JSON: {\"content_mismatch\":bool,\"confidence\":0-1,\"reason\":\"stručně cs\"}",
      user: `Lekce: ${input.lessonTitle}\nObsah: ${input.lessonContent.slice(0, 800)}\nVideo: ${input.videoTitle ?? "?"}\nPopis videa: ${input.videoDescription ?? "?"}`,
      maxTokens: 200,
      temperature: 0.2,
    });
    if (!text) return rule;
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      content_mismatch?: boolean;
      confidence?: number;
      reason?: string;
    };
    if (parsed.content_mismatch && alignmentScore >= SLIDESHOW_ALIGNMENT_THRESHOLD) {
      return slideshowAlignedResult(alignmentScore);
    }
    return {
      ok: !parsed.content_mismatch,
      content_mismatch: Boolean(parsed.content_mismatch),
      confidence: Number(parsed.confidence ?? 0.8),
      reason: parsed.reason ?? rule.reason,
      flags: parsed.content_mismatch ? ["llm_content_mismatch", ...rule.flags] : rule.flags,
    };
  } catch {
    return rule;
  }
}
