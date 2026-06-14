/**
 * v25.2 — category-aware image templates for verejnost + professional content.
 */

export const CATEGORY_TEMPLATES = {
  rozhovory: {
    module: "interview",
    imageType: "illustration",
    promptExtra:
      "MedScopeGlobal logo subtly visible, professional podcast microphone on desk, warm interview studio aesthetic, European medical editorial, no identifiable faces.",
  },
  nemoci: {
    module: "anatomy",
    imageType: "illustration",
    promptExtra:
      "Medical topic illustration, European clinical context, anatomical or diagnostic visuals, trustworthy academic tone, no identifiable patients.",
  },
  prevence: {
    module: "verejnost",
    imageType: "environment",
    promptExtra:
      "Preventive healthcare, screening and wellness, clean European clinic or community health setting, optimistic professional mood.",
  },
  "zivotni-styl": {
    module: "verejnost",
    imageType: "environment",
    promptExtra:
      "Healthy lifestyle, nutrition, sleep and movement, modern European urban wellness context, bright natural light.",
  },
};

const TOPIC_ALIASES = {
  rozhovory: ["rozhovor", "rozhovory", "interview", "host", "mikrofon", "podcast"],
  nemoci: ["nemoc", "nemoci", "diagnóza", "diagnosa", "onemocnění", "onemocneni"],
  prevence: ["prevence", "prevenci", "screening", "očkování", "ockovani"],
  "zivotni-styl": ["životní styl", "zivotni styl", "výživa", "vyziva", "spánek", "spánek", "fitness"],
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
