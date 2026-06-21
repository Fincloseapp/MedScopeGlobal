/**
 * GROQ-powered slide image matcher — maps each slide's text to a relevant free image.
 */
import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";
import {
  DEFAULT_SLIDE_IMAGE,
  GRANULAR_TOPIC_IMAGES,
  isBrokenSlideImageUrl,
  matchGranularTopic,
  resolveKeywordImage,
  resolveSlideImageFromQuery,
  searchWikimedia,
  verifyImageUrl,
} from "./slide-image-matcher-core.mjs";

export {
  DEFAULT_SLIDE_IMAGE,
  GRANULAR_TOPIC_IMAGES,
  isBrokenSlideImageUrl,
  matchGranularTopic,
  relevanceScore,
  verifyImageUrl,
} from "./slide-image-matcher-core.mjs";

export type SlideImageMatchInput = {
  slideTitle: string;
  slideBody: string;
  lessonTitle: string;
  courseTopic: string;
};

export type SlideImageMatchResult = {
  imageUrl: string;
  imageAlt: string;
  imageSearchQuery: string;
  wikimediaSearchTerm: string;
  source: "wikimedia" | "keyword_map" | "default" | "fallback" | "groq_cached";
};

const MATCH_SYSTEM = `Jsi vizuální editor medicínské vzdělávací platformy. Vrať pouze JSON:
{
  "imageSearchQuery": "very specific English search phrase for educational medical illustration (5-12 words)",
  "imageAlt": "Czech alt text describing what the image should show",
  "wikimediaSearchTerm": "English Wikimedia Commons search query (3-6 words, e.g. human skeleton anterior anatomy)"
}
Pravidla:
- imageSearchQuery MUSÍ odpovídat konkrétnímu obsahu slidu (ne generické „medicine")
- Pro anatomické roviny → "anatomical planes sagittal frontal transverse diagram"
- Pro kostru → "human skeleton anterior view anatomy education"
- Pro orientaci v těle → "human body anatomical position regions diagram"
- Žádné jídlo, sport, random stock — pouze medicínsko-anatomické vizuály`;

export async function groqSlideImageQuery(input: SlideImageMatchInput): Promise<{
  imageSearchQuery: string;
  imageAlt: string;
  wikimediaSearchTerm: string;
} | null> {
  if (!isGroqConfigured()) return null;

  const raw = await groqCompleteJson({
    system: MATCH_SYSTEM,
    user: `Kurz: ${input.courseTopic}
Lekce: ${input.lessonTitle}
Slide titulek: ${input.slideTitle}
Slide text: ${input.slideBody.slice(0, 600)}`,
    maxTokens: 512,
    temperature: 0.2,
    model: resolveAiModel(),
  });

  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      imageSearchQuery?: string;
      imageAlt?: string;
      wikimediaSearchTerm?: string;
    };
    if (!parsed.imageSearchQuery && !parsed.wikimediaSearchTerm) return null;
    return {
      imageSearchQuery: parsed.imageSearchQuery ?? parsed.wikimediaSearchTerm ?? "",
      imageAlt: parsed.imageAlt ?? input.slideTitle,
      wikimediaSearchTerm: parsed.wikimediaSearchTerm ?? parsed.imageSearchQuery ?? "",
    };
  } catch {
    return null;
  }
}

export async function matchSlideImage(input: SlideImageMatchInput): Promise<SlideImageMatchResult> {
  const groqQuery = await groqSlideImageQuery(input);

  const query = groqQuery ?? {
    imageSearchQuery: [input.slideTitle, input.slideBody, input.lessonTitle].join(" ").slice(0, 120),
    imageAlt: input.slideTitle,
    wikimediaSearchTerm: matchGranularTopic(
      `${input.courseTopic} ${input.lessonTitle} ${input.slideTitle} ${input.slideBody}`
    ).replace(/_/g, " "),
  };

  const resolved = await resolveSlideImageFromQuery({
    ...query,
    slideTitle: input.slideTitle,
    slideBody: input.slideBody,
    lessonTitle: input.lessonTitle,
    courseTopic: input.courseTopic,
  });

  return {
    imageUrl: resolved.imageUrl,
    imageAlt: query.imageAlt,
    imageSearchQuery: query.imageSearchQuery,
    wikimediaSearchTerm: query.wikimediaSearchTerm,
    source: resolved.source as SlideImageMatchResult["source"],
  };
}

export async function matchAllSlideImages<
  T extends { title: string; body: string; imageUrl?: string; imageAlt?: string },
>(slides: T[], lessonTitle: string, courseTopic: string): Promise<(T & { imageUrl: string; imageAlt: string })[]> {
  const out: (T & { imageUrl: string; imageAlt: string })[] = [];
  for (const slide of slides) {
    const match = await matchSlideImage({
      slideTitle: slide.title,
      slideBody: slide.body,
      lessonTitle,
      courseTopic,
    });
    out.push({
      ...slide,
      imageUrl: match.imageUrl,
      imageAlt: match.imageAlt,
      imageDescription: match.imageAlt,
    });
  }
  return out;
}

/** Client-side fallback when stored URL broken — no GROQ. */
export function resolveStoredSlideImage(
  slide: { title: string; body: string; imageUrl?: string; imageAlt?: string },
  lessonTitle: string,
  courseTopic: string
): string {
  if (slide.imageUrl && !isBrokenSlideImageUrl(slide.imageUrl)) return slide.imageUrl;
  return resolveKeywordImage(`${courseTopic} ${lessonTitle} ${slide.title} ${slide.body}`);
}

export async function headCheckSlideImages(
  slides: { title: string; imageUrl?: string }[]
): Promise<{ title: string; url: string; ok: boolean }[]> {
  const results = [];
  for (const s of slides) {
    const url = s.imageUrl ?? DEFAULT_SLIDE_IMAGE;
    results.push({ title: s.title, url, ok: await verifyImageUrl(url) });
  }
  return results;
}
