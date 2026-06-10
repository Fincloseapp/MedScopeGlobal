/**
 * v25.1 AI Image Selector — analyze content, pick image type, match from library or trigger generator.
 */
import { readJson } from "../shared.mjs";
import { buildSafePrompt, filterImageStyle } from "./style-filter.mjs";

const IMAGE_TYPES = ["illustration", "icon", "environment", "object"];

const TOPIC_RULES = [
  { re: /přijímač|přijimack|studium|univerzit|fakult/i, type: "environment", module: "university" },
  { re: /lék|farmak|medik|pilul|tableta|recept/i, type: "object", module: "drug" },
  { re: /zákon|legislat|vyhlášk|směrnic|regulac/i, type: "illustration", module: "legislation" },
  { re: /digitáln|telemedic|aplikac|e-health|ai\b/i, type: "illustration", module: "digitalHealth" },
  { re: /studie|výzkum|pubmed|randomiz/i, type: "illustration", module: "study" },
  { re: /kvíz|otázka|test\b/i, type: "icon", module: "medicina" },
  { re: /anatom|orgán|srdce|mozek|kost/i, type: "object", module: "anatomy" },
  { re: /kongres|konference|sympoz/i, type: "environment", module: "congress" },
];

const STOP_WORDS = new Set([
  "a", "i", "o", "u", "v", "z", "s", "k", "na", "po", "do", "od", "pro", "ze", "je", "jsou", "byl", "byla",
  "the", "and", "for", "with", "that", "this", "from", "are", "was", "have", "has", "not",
]);

function tokenize(text) {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function firstSentences(text, count = 2) {
  const clean = (text ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const parts = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, count).join(" ") || clean.slice(0, 280);
}

/**
 * @param {{ title?: string; excerpt?: string; body?: string; section?: string; metadata?: Record<string, unknown> }} input
 */
export function analyzeContent(input) {
  const lead = firstSentences(input.excerpt || input.body || input.title || "", 2);
  const combined = `${input.title ?? ""} ${lead} ${JSON.stringify(input.metadata ?? {})}`;
  const keywords = [...new Set(tokenize(combined))].slice(0, 12);

  let imageType = "illustration";
  let module = "medicina";

  for (const rule of TOPIC_RULES) {
    if (rule.re.test(combined)) {
      imageType = rule.type;
      module = rule.module;
      break;
    }
  }

  if (input.section) {
    const sec = String(input.section).toLowerCase();
    if (sec.includes("legislat")) module = "legislation";
    else if (sec.includes("drug") || sec.includes("lek")) module = "drug";
    else if (sec.includes("univer") || sec.includes("studium")) module = "university";
    else if (sec.includes("digital")) module = "digitalHealth";
    else if (sec.includes("stud")) module = "study";
    else if (sec.includes("quiz") || sec.includes("kviz")) module = "medicina";
  }

  const prompt = buildSafePrompt({
    title: input.title,
    topics: keywords,
    imageType,
    section: input.section ?? module,
  });

  const style = filterImageStyle(prompt, { alt: input.title, prompt, imageType });

  return {
    lead,
    keywords,
    imageType,
    module,
    prompt,
    stylePassed: style.passed,
    styleRejected: style.rejected,
  };
}

export function loadImageRegistry() {
  return readJson("images/registry.json") ?? { at: null, images: [] };
}

/**
 * Find existing image in registry by slug + section.
 */
export function findRegisteredImage(section, slug) {
  const reg = loadImageRegistry();
  return reg.images?.find((i) => i.section === section && i.slug === slug) ?? null;
}

/**
 * Select image: registry hit → else needs generation.
 * @param {{ id: string; slug: string; section: string; title: string; excerpt?: string; body?: string; imageUrl?: string | null }} item
 */
export function selectImageForItem(item) {
  if (item.imageUrl) {
    return {
      action: "skip",
      reason: "already-has-image",
      imageUrl: item.imageUrl,
      source: "existing",
    };
  }

  const analysis = analyzeContent(item);
  const registered = findRegisteredImage(item.section, item.slug);

  if (registered?.publicUrl && registered?.stylePassed !== false) {
    return {
      action: "use-registry",
      analysis,
      registered,
      imageUrl: registered.publicUrl,
      source: "selector",
      imageType: registered.imageType ?? analysis.imageType,
    };
  }

  return {
    action: "generate",
    analysis,
    source: "generator",
    imageType: analysis.imageType,
    module: analysis.module,
    prompt: analysis.prompt,
  };
}

export { IMAGE_TYPES, firstSentences, tokenize };
