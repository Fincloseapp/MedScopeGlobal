/**
 * v25.2 AI Image Selector — category templates, content analysis, registry match.
 */
import { readJson } from "../shared.mjs";
import { buildSafePrompt, filterImageStyle } from "./style-filter.mjs";
import { isLegacyImageUrl } from "./legacy-images.mjs";
import { getCategoryTemplate, resolveCategoryKey } from "./category-templates.mjs";

const IMAGE_TYPES = ["illustration", "icon", "environment", "object"];

const TOPIC_RULES = [
  { re: /rozhovor|interview|podcast|mikrofon|host\b/i, type: "illustration", module: "interview", category: "rozhovory" },
  { re: /verejnost|veřejnost|zdravý život/i, type: "environment", module: "verejnost" },
  { re: /přijímač|přijimack|studium|univerzit|fakult/i, type: "environment", module: "university" },
  { re: /lék|farmak|medik|pilul|tableta|recept/i, type: "object", module: "drug" },
  { re: /zákon|legislat|vyhlášk|směrnic|regulac/i, type: "illustration", module: "legislation" },
  { re: /digitáln|telemedic|aplikac|e-health|ai\b/i, type: "illustration", module: "digitalHealth" },
  { re: /studie|výzkum|pubmed|randomiz/i, type: "illustration", module: "study" },
  { re: /kvíz|otázka|test\b/i, type: "icon", module: "medicina" },
  { re: /anatom|orgán|srdce|mozek|kost|nemoc/i, type: "object", module: "anatomy" },
  { re: /prevenc|screening|očkov/i, type: "environment", module: "verejnost", category: "prevence" },
  { re: /životní styl|výživa|spánek|fitness/i, type: "environment", module: "verejnost", category: "zivotni-styl" },
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

function applyCategoryTemplate(analysis, categoryKey) {
  const tpl = getCategoryTemplate(categoryKey);
  if (!tpl) return analysis;
  return {
    ...analysis,
    imageType: tpl.imageType ?? analysis.imageType,
    module: tpl.module ?? analysis.module,
    category: categoryKey,
    categoryExtra: tpl.promptExtra,
    prompt: buildSafePrompt({
      title: analysis.title,
      topics: analysis.keywords,
      imageType: tpl.imageType ?? analysis.imageType,
      section: analysis.section,
      categoryExtra: tpl.promptExtra,
    }),
  };
}

/**
 * @param {{ title?: string; excerpt?: string; body?: string; section?: string; metadata?: Record<string, unknown> }} input
 */
export function analyzeContent(input) {
  const lead = firstSentences(input.excerpt || input.body || input.title || "", 2);
  const combined = `${input.title ?? ""} ${lead} ${JSON.stringify(input.metadata ?? {})}`;
  const keywords = [...new Set(tokenize(combined))].slice(0, 12);

  let imageType = "illustration";
  let themeKey = "medicina";
  let categoryKey = resolveCategoryKey(input);

  for (const rule of TOPIC_RULES) {
    if (rule.re.test(combined)) {
      imageType = rule.type;
      themeKey = rule.module;
      if (rule.category) categoryKey = rule.category;
      break;
    }
  }

  if (input.section) {
    const sec = String(input.section).toLowerCase();
    if (sec.includes("legislat")) themeKey = "legislation";
    else if (sec.includes("drug") || sec.includes("lek")) themeKey = "drug";
    else if (sec.includes("univer") || sec.includes("studium")) themeKey = "university";
    else if (sec.includes("digital")) themeKey = "digitalHealth";
    else if (sec.includes("stud")) themeKey = "study";
    else if (sec.includes("quiz") || sec.includes("kviz")) themeKey = "medicina";
    else if (sec.includes("verejnost")) themeKey = "verejnost";
  }

  let prompt = buildSafePrompt({
    title: input.title,
    topics: keywords,
    imageType,
    section: input.section ?? themeKey,
    categoryExtra: getCategoryTemplate(categoryKey)?.promptExtra,
  });

  const style = filterImageStyle(prompt, { alt: input.title, prompt, imageType, requireHandsDirective: true });

  let analysis = {
    title: input.title,
    lead,
    keywords,
    imageType,
    module: themeKey,
    category: categoryKey,
    section: input.section ?? themeKey,
    prompt,
    stylePassed: style.passed,
    styleRejected: style.rejected,
  };

  if (categoryKey) {
    analysis = applyCategoryTemplate(analysis, categoryKey);
    const restyle = filterImageStyle(analysis.prompt, {
      alt: input.title,
      prompt: analysis.prompt,
      imageType: analysis.imageType,
      requireHandsDirective: true,
    });
    analysis.stylePassed = restyle.passed;
    analysis.styleRejected = restyle.rejected;
  }

  return analysis;
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

function needsCategoryRefresh(item, registered, analysis) {
  if (!registered?.publicUrl || isLegacyImageUrl(registered.publicUrl)) return true;
  if (registered.stylePassed === false) return true;
  if (analysis.category && registered.module && registered.module !== analysis.module) return true;
  if (analysis.category === "rozhovory" && registered.module !== "interview") return true;
  return false;
}

/**
 * Select image: registry hit → else needs generation.
 * @param {{ id: string; slug: string; section: string; title: string; excerpt?: string; body?: string; imageUrl?: string | null; metadata?: Record<string, unknown> }} item
 */
export function selectImageForItem(item) {
  const analysis = analyzeContent(item);
  const hasModernImage = item.imageUrl && !isLegacyImageUrl(item.imageUrl);
  const registered = findRegisteredImage(item.section, item.slug);
  const categoryMismatch = registered ? needsCategoryRefresh(item, registered, analysis) : false;

  if (hasModernImage && !categoryMismatch) {
    return {
      action: "skip",
      reason: "already-has-image",
      imageUrl: item.imageUrl,
      source: "existing",
      analysis,
    };
  }

  if (
    registered?.publicUrl &&
    registered?.stylePassed !== false &&
    !isLegacyImageUrl(registered.publicUrl) &&
    !categoryMismatch
  ) {
    return {
      action: "use-registry",
      analysis,
      registered,
      imageUrl: registered.publicUrl,
      source: "selector",
      imageType: registered.imageType ?? analysis.imageType,
      module: analysis.module,
      needsDbUpdate: Boolean(item.imageUrl && (isLegacyImageUrl(item.imageUrl) || categoryMismatch)),
    };
  }

  return {
    action: "generate",
    analysis,
    source: "generator",
    imageType: analysis.imageType,
    module: analysis.module,
    category: analysis.category,
    prompt: analysis.prompt,
    needsDbUpdate: true,
    replaceLegacy: Boolean(item.imageUrl && isLegacyImageUrl(item.imageUrl)),
    replaceCategory: categoryMismatch,
  };
}

export { IMAGE_TYPES, firstSentences, tokenize };
