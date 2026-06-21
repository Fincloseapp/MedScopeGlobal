/**
 * GROQ-powered slide image matcher — maps each slide's text to a relevant free image.
 */
import { groqCompleteJson, isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";
import { DEFAULT_SLIDE_IMAGE, isBrokenSlideImageUrl } from "@/lib/v25/video/slide-images";

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

const GRANULAR_TOPIC_IMAGES: Record<string, string> = {
  anatomical_planes:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",
  orientation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Human_anatomy_planes.jpg/960px-Human_anatomy_planes.jpg",
  skeleton:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png",
  muscle:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Biceps_brachii_muscle.jpg/800px-Biceps_brachii_muscle.jpg",
  heart:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Diagram_of_the_human_heart_%28cropped%29.svg/800px-Diagram_of_the_human_heart_%28cropped%29.svg.png",
  circulation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Circulatory_System_en.svg/800px-Circulatory_System_en.svg.png",
  brain:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Brain_human_sagittal_section.svg/800px-Brain_human_sagittal_section.svg.png",
  lung:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lungs_diagram_detailed.svg/800px-Lungs_diagram_detailed.svg.png",
  cell:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Animal_cell_structure_en.svg/800px-Animal_cell_structure_en.svg.png",
  default: DEFAULT_SLIDE_IMAGE,
};

const CS_TOPIC_RULES: [RegExp, string][] = [
  [/sagitáln|sagittal/i, "anatomical_planes"],
  [/koronáln|frontáln|coronal|frontal/i, "anatomical_planes"],
  [/transverz|transversal|horizontáln/i, "anatomical_planes"],
  [/anatomick[áa]\s+rovin|rovin\s+sagit|rovin\s+koron|rovin\s+transverz/i, "anatomical_planes"],
  [/orientac|poloh|supin|prone|anatomick/i, "orientation"],
  [/kostra|kostern|skelet|lebka|páteř/i, "skeleton"],
  [/sval|myolog/i, "muscle"],
  [/srdce|kardi|ekg|srdeční/i, "heart"],
  [/krev|oběh|cirkul/i, "circulation"],
  [/mozek|neurolog|nerv/i, "brain"],
  [/plic|dých|respir/i, "lung"],
  [/buněk|buně|biolog|genet|dna/i, "cell"],
];

export function matchGranularTopic(haystack: string): string {
  for (const [re, key] of CS_TOPIC_RULES) {
    if (re.test(haystack)) return key;
  }
  return "default";
}

export function resolveKeywordImage(haystack: string): string {
  const key = matchGranularTopic(haystack);
  return GRANULAR_TOPIC_IMAGES[key] ?? GRANULAR_TOPIC_IMAGES.default!;
}

export async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (head.ok) return true;
    const get = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000) });
    return get.ok;
  } catch {
    return false;
  }
}

export async function searchWikimedia(term: string): Promise<string | null> {
  const q = encodeURIComponent(term.slice(0, 100));
  try {
    const res = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    for (const page of Object.values(pages) as { imageinfo?: { thumburl?: string; url?: string }[] }[]) {
      const url = page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url;
      if (url?.startsWith("http") && (await verifyImageUrl(url))) return url;
    }
  } catch {
    /* skip */
  }
  return null;
}

export async function resolveSlideImageFromQuery(query: {
  imageSearchQuery?: string;
  wikimediaSearchTerm?: string;
  slideTitle?: string;
  slideBody?: string;
  lessonTitle?: string;
  courseTopic?: string;
}): Promise<{ imageUrl: string; source: SlideImageMatchResult["source"] }> {
  const haystack = query.imageSearchQuery || query.wikimediaSearchTerm || "";
  const wikiTerm = query.wikimediaSearchTerm || query.imageSearchQuery || "";

  if (wikiTerm) {
    const wiki = await searchWikimedia(wikiTerm);
    if (wiki) return { imageUrl: wiki, source: "wikimedia" };
  }

  const curated = resolveKeywordImage(
    [query.slideTitle, query.slideBody, query.lessonTitle, query.courseTopic, haystack].filter(Boolean).join(" ")
  );
  if (curated && !isBrokenSlideImageUrl(curated) && (await verifyImageUrl(curated))) {
    return { imageUrl: curated, source: "keyword_map" };
  }

  if (query.slideTitle) {
    const titleWiki = await searchWikimedia(`${query.slideTitle} anatomy diagram`);
    if (titleWiki) return { imageUrl: titleWiki, source: "wikimedia" };
  }

  if (await verifyImageUrl(DEFAULT_SLIDE_IMAGE)) {
    return { imageUrl: DEFAULT_SLIDE_IMAGE, source: "default" };
  }
  return { imageUrl: curated ?? DEFAULT_SLIDE_IMAGE, source: "fallback" };
}

export function relevanceScore(slideTitle: string, imageAlt: string): number {
  const tokens = (slideTitle + " " + imageAlt)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (!tokens.length) return 0;
  const altWords = new Set(
    imageAlt
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
  const hits = tokens.filter((t) => altWords.has(t) || [...altWords].some((a) => a.includes(t) || t.includes(a)));
  return hits.length / tokens.length;
}

const MATCH_SYSTEM = `Jsi vizuální editor medicínské vzdělávací platformy. Vrať pouze JSON:
{
  "imageSearchQuery": "very specific English search phrase for educational medical illustration (5-12 words)",
  "imageAlt": "Czech alt text describing what the image should show",
  "wikimediaSearchTerm": "English Wikimedia Commons search query (3-6 words)"
}
Pravidla: imageSearchQuery MUSÍ odpovídat konkrétnímu obsahu slidu. Pro anatomické roviny/polohy/kostru použij přesné anatomické termíny.`;

export async function groqSlideImageQuery(input: SlideImageMatchInput) {
  if (!isGroqConfigured()) return null;
  const raw = await groqCompleteJson({
    system: MATCH_SYSTEM,
    user: `Kurz: ${input.courseTopic}\nLekce: ${input.lessonTitle}\nSlide: ${input.slideTitle}\n${input.slideBody.slice(0, 600)}`,
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
    imageSearchQuery: [input.slideTitle, input.slideBody].join(" ").slice(0, 120),
    imageAlt: input.slideTitle,
    wikimediaSearchTerm: `${matchGranularTopic(`${input.slideTitle} ${input.slideBody}`).replace(/_/g, " ")} anatomy`,
  };
  const resolved = await resolveSlideImageFromQuery({ ...query, ...input });
  return { ...query, imageUrl: resolved.imageUrl, source: resolved.source };
}

export function resolveStoredSlideImage(
  slide: { title: string; body: string; imageUrl?: string; imageAlt?: string },
  lessonTitle: string,
  courseTopic: string
): string {
  if (slide.imageUrl && !isBrokenSlideImageUrl(slide.imageUrl)) return slide.imageUrl;
  return resolveKeywordImage(`${courseTopic} ${lessonTitle} ${slide.title} ${slide.body}`);
}
