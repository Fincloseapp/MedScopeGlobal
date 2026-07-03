/**
 * v25.2 — category-aware image templates for verejnost + professional content.
 */

export const CATEGORY_TEMPLATES = {
  rozhovory: {
    module: "interview",
    imageType: "illustration",
    promptExtra:
      "Editorial podcast studio with microphone and medical notes on desk, Czech health magazine aesthetic, warm lighting, no identifiable faces.",
  },
  nemoci: {
    module: "anatomy",
    imageType: "illustration",
    promptExtra:
      "Clean medical diagram or diagnostic equipment illustration, Czech clinical context, educational-popular science style, no patient portraits.",
  },
  prevence: {
    module: "verejnost",
    imageType: "environment",
    promptExtra:
      "Preventive healthcare scene — screening equipment, wellness checklist, European community clinic, optimistic professional mood, no stock faces.",
  },
  "zivotni-styl": {
    module: "verejnost",
    imageType: "environment",
    promptExtra:
      "Healthy lifestyle editorial — nutrition, sleep, movement symbols, modern Czech urban wellness, bright natural light, equipment-focused not portraits.",
  },
  medical: {
    module: "medicina",
    imageType: "illustration",
    promptExtra:
      "Czech medical editorial illustration, clinical equipment or anatomical diagram, European hospital context, educational-popular style, no identifiable faces or stock portraits.",
  },
  medicina: {
    module: "medicina",
    imageType: "illustration",
    promptExtra:
      "Professional Czech health magazine cover art, medical instruments or gloved hands only, clean European clinic, trustworthy academic tone, no patient portraits.",
  },
};

const TOPIC_ALIASES = {
  rozhovory: ["rozhovor", "rozhovory", "interview", "host", "mikrofon", "podcast"],
  nemoci: ["nemoc", "nemoci", "diagnóza", "diagnosa", "onemocnění", "onemocneni"],
  prevence: ["prevence", "prevenci", "screening", "očkování", "ockovani"],
  "zivotni-styl": ["životní styl", "zivotni styl", "výživa", "vyziva", "spánek", "spánek", "fitness"],
  medical: ["medical", "medicína", "medicina", "klinika", "nemocnice", "lékař", "lekar"],
  medicina: ["medicína", "medicina", "klinický", "klinicky"],
};

/**
 * Resolve category key from metadata, slug, title, or body text.
 * @param {{ metadata?: Record<string, unknown>; title?: string; excerpt?: string; body?: string; slug?: string; section?: string }} input
 */
export function resolveCategoryKey(input) {
  const meta = input.metadata ?? {};
  const publicTopic = String(meta.publicTopic ?? meta.public_topic ?? "").toLowerCase().trim();
  const rubric = String(meta.rubricSlug ?? meta.rubric_slug ?? "").toLowerCase().trim();
  const combined = `${input.title ?? ""} ${input.excerpt ?? ""} ${input.slug ?? ""} ${input.section ?? ""}`.toLowerCase();

  if (publicTopic && CATEGORY_TEMPLATES[publicTopic]) return publicTopic;
  if (rubric && CATEGORY_TEMPLATES[rubric]) return rubric;
  if (/rozhovor|interview|podcast|mikrofon/i.test(combined)) return "rozhovory";

  for (const [key, aliases] of Object.entries(TOPIC_ALIASES)) {
    if (aliases.some((a) => combined.includes(a))) return key;
  }

  return null;
}

/**
 * @param {string | null | undefined} categoryKey
 */
export function getCategoryTemplate(categoryKey) {
  if (!categoryKey) return null;
  return CATEGORY_TEMPLATES[categoryKey] ?? null;
}
