/**
 * Autonomous editorial image control for MedScopeGlobal (CZ/EU medical magazine).
 * Single source of truth for cover bans, audience guidance, and safe fallbacks.
 */

/** Hard-banned Unsplash / Wikimedia fragments — brain-on-stick and related props. */
export const BANNED_COVER_IDS = [
  // Classic plastic brain anatomical model on a stand ("mozek na tyčce")
  "photo-1559757175-0eb30cd8c063",
  // Related pink brain / anatomy-prop stock often swapped in as "brain" fallback
  "photo-1559757175-5700cde872bc",
  // Wikimedia sagittal SVG used as crude brain cover
  "Brain_human_sagittal_section",
  "1/14/Brain_human_sagittal_section",
];

/** Prior v27.3 stock denylist (non-EU / stereotypical clinical-hand tropes). */
export const BANNED_STOCK_IDS = [
  "photo-1576091160550-2173dba999ef",
  "photo-1582750433449-648ed127bb54",
  "photo-1519494026892-80bbd2d6fd0d",
  "photo-1559839734-2b71ea197ec2",
  "photo-1538108149393-fbbd81895907",
  "photo-1584513570327-1f25d0c7d098",
  "photo-1612349317150-e413f6a5b16d",
  "photo-1505751172879-fb9847c0e0c0",
  "photo-1505751172876-fa1923c5c528",
  "photo-1505751172876-fbf96182a2d8",
  "photo-1581594693702-fbdc00b0a2d6",
  "photo-1631217868264-e5b1ff5d8800",
  "photo-1581595214485-989ff4a4c44d",
  "photo-1579684385127-1ef15d508118",
];

export const ALL_BANNED_IDS = [...BANNED_COVER_IDS, ...BANNED_STOCK_IDS];

/**
 * Visual / prompt fingerprint keywords for brain-on-stick and banned props.
 * Used on URLs, alt text, and generation prompts.
 */
export const BANNED_VISUAL_KEYWORDS = [
  /brain[\s_-]*on[\s_-]*(?:a[\s_-]*)?(?:stick|stand|skewer|rod|pole)/i,
  /anatomical[\s_-]*brain[\s_-]*model/i,
  /plastic[\s_-]*brain[\s_-]*(?:model|prop)/i,
  /brain[\s_-]*model[\s_-]*(?:on[\s_-]*)?(?:stand|stick|skewer)/i,
  /mozku?\s+na\s+ty[cč]ce/i,
  /mozek\s+na\s+ty[cč]/i,
  /brain[\s_-]*skewer/i,
  /Brain_human_sagittal_section/i,
  /photo-1559757175-0eb30cd8c063/i,
  /photo-1559757175-5700cde872bc/i,
];

/**
 * Editorial audience preference for CZ/EU magazine stock selection & AI prompts.
 * Regional relevance — not a hate filter.
 */
export const AUDIENCE_GUIDANCE = {
  prefer:
    "European, Latino/Latina, Asian, and North-American presentation appropriate for a Czech/EU medical magazine audience",
  minimize:
    "stereotypical stock tropes of African/Black clinical hands or generic diversity-stock medical clichés when a European/CZ clinic scene fits better",
  framing:
    "Choose imagery for regional editorial relevance to Czech and EU readers — not demographic exclusion.",
};

/** First-party magazine covers (synced from production /assets/covers). */
export const LOCAL_MAGAZINE_COVERS = [
  "/assets/covers/research.webp",
  "/assets/covers/research-2.webp",
  "/assets/covers/seniors.webp",
  "/assets/covers/calm-2.webp",
  "/assets/covers/movement.webp",
  "/assets/covers/movement-2.webp",
  "/assets/covers/walk.webp",
  "/assets/covers/produce.webp",
  "/assets/covers/clinical-2.webp",
  "/assets/covers/clinical-3.webp",
  "/assets/covers/science.webp",
  "/assets/covers/food-4.webp",
];

/** Laptop / workstation scenes must show MedScopeGlobal on-screen branding. */
export const LAPTOP_BRAND_COVERS = [
  "/assets/medscopeglobal-digital-health-specialist.png",
  "/assets/medscopeglobal-research-workstation.png",
  "/assets/ai/assistant-brunette.webp",
];

export const MEDSCOPE_SCREEN_BRANDING =
  "If a laptop, monitor, tablet, or phone screen is visible, the screen MUST clearly show MedScopeGlobal branding (logo and/or medscopeglobal.com) — never a blank or generic desktop.";

function localCover(seed, offset = 0) {
  const i = (hashSeed(seed) + offset) % LOCAL_MAGAZINE_COVERS.length;
  return LOCAL_MAGAZINE_COVERS[i];
}

/** Curated safe covers — prefer first-party assets; Unsplash only as last-resort allowlist. */
export const SAFE_CURATED_PHOTOS = {
  medicina: "/assets/covers/clinical-3.webp",
  study: "/assets/covers/research.webp",
  drug: "/assets/covers/science.webp",
  legislation: "/assets/covers/research-2.webp",
  digitalHealth: "/assets/medscopeglobal-digital-health-specialist.png",
  university: "/assets/covers/research.webp",
  congress: "/assets/covers/movement.webp",
  /** Was brain-on-stick Unsplash — local clinical/education cover */
  anatomy: "/assets/covers/clinical-2.webp",
  verejnost: "/assets/covers/produce.webp",
  interview: "/assets/covers/calm-2.webp",
  hero: "/assets/covers/walk.webp",
  magazine: "/assets/covers/seniors.webp",
  laptop: "/assets/medscopeglobal-digital-health-specialist.png",
};

export const ALLOWED_UNSPLASH_IDS = [
  "photo-1584515930387-285e4804f4cb",
  "photo-1576091160399-112ba8d25d1d",
  "photo-1559757148-5c350d0d3c56",
  "photo-1523050854058-8df90110c9f1",
  "photo-1573164713714-d95e436ab8d6",
  "photo-1584308664744-24d5c474f2ae",
  "photo-1478737270239-2f02e77f67c9",
  "photo-1589829545855-d10d557cf95f",
  "photo-1540575467063-178a50c2df87",
];

const TOPIC_MODULE = {
  "zivotni-styl": "verejnost",
  nemoci: "study",
  prevence: "hero",
  rozhovory: "interview",
  dlouhovekost: "verejnost",
  anatom: "anatomy",
  mozek: "anatomy",
  brain: "anatomy",
  digital: "digitalHealth",
  laptop: "laptop",
  computer: "laptop",
};

function hashSeed(seed) {
  return Math.abs(
    String(seed || "cover")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % 999
  );
}

export function hasBannedCoverId(url) {
  if (!url) return false;
  const u = String(url);
  return ALL_BANNED_IDS.some((id) => u.includes(id));
}

export function matchesBannedVisualKeyword(text) {
  if (!text) return false;
  const t = String(text);
  return BANNED_VISUAL_KEYWORDS.some((re) => re.test(t));
}

export function isBannedCoverUrl(url) {
  if (!url?.trim()) return false;
  const u = url.trim();
  if (hasBannedCoverId(u)) return true;
  if (matchesBannedVisualKeyword(u)) return true;
  return false;
}

export function isLaptopSceneHint(text) {
  return /laptop|notebook|po[cč]íta[cč]|monitor|tablet|obrazovk|screen|workstation|digit[aá]ln/i.test(
    String(text ?? "")
  );
}

export function pickLaptopBrandCover(seed) {
  const i = hashSeed(seed) % LAPTOP_BRAND_COVERS.length;
  return LAPTOP_BRAND_COVERS[i];
}

export function curatedCoverForModule(moduleKey, seed) {
  const key = moduleKey && SAFE_CURATED_PHOTOS[moduleKey] ? moduleKey : "medicina";
  if (key === "laptop" || key === "digitalHealth") {
    return SAFE_CURATED_PHOTOS[key];
  }
  // Rotate first-party covers by seed so cards don't all share one image
  return localCover(seed);
}

export function resolveTopicModule(input = {}) {
  const blob = [
    input.title,
    input.category,
    input.excerpt,
    input.slug,
    input.public_topic,
    input.module,
  ]
    .filter(Boolean)
    .join(" ");
  if (isLaptopSceneHint(blob)) return "laptop";
  for (const [needle, mod] of Object.entries(TOPIC_MODULE)) {
    if (new RegExp(needle, "i").test(blob)) return mod;
  }
  return "medicina";
}

/**
 * Gate every cover URL through editorial policy.
 * Banned / empty → curated safe fallback (laptop brand asset when scene hints laptop).
 */
export function resolveEditorialCover(input = {}) {
  const direct = typeof input.coverUrl === "string" ? input.coverUrl.trim() : "";
  const moduleKey = resolveTopicModule(input);
  const seed = input.slug || input.title || "cover";

  if (direct && !isBannedCoverUrl(direct)) {
    if (isLaptopSceneHint(`${input.title ?? ""} ${input.excerpt ?? ""} ${direct}`)) {
      // Prefer branded workstation assets for laptop/digital scenes even if DB has a random stock URL
      if (/unsplash\.com|wikimedia\.org/i.test(direct) && !/medscope/i.test(direct)) {
        return pickLaptopBrandCover(seed);
      }
    }
    return direct;
  }

  if (moduleKey === "laptop" || moduleKey === "digitalHealth") {
    return curatedCoverForModule(moduleKey, seed);
  }
  return curatedCoverForModule(moduleKey, seed);
}

/** Audience + branding clauses for AI / Unsplash selection prompts. */
export function buildEditorialImageGuidance() {
  return [
    `Audience: ${AUDIENCE_GUIDANCE.prefer}.`,
    `Minimize: ${AUDIENCE_GUIDANCE.minimize}.`,
    AUDIENCE_GUIDANCE.framing,
    MEDSCOPE_SCREEN_BRANDING,
    "Never depict a plastic anatomical brain model on a stick/stand/skewer (mozek na tyčce).",
    "Prefer medical equipment, diagrams, European clinic interiors, or gloved clinical hands.",
  ].join(" ");
}

/** Score a candidate URL/prompt for selection (higher = better). */
export function scoreCoverCandidate({ url, prompt, title, excerpt } = {}) {
  let score = 50;
  const blob = `${url ?? ""} ${prompt ?? ""} ${title ?? ""} ${excerpt ?? ""}`;
  if (isBannedCoverUrl(url) || matchesBannedVisualKeyword(blob)) return -1000;
  if (/\/assets\/(?:covers|medscopeglobal|ai\/assistant|magazine)\//i.test(url ?? "")) {
    score += 40;
  }
  if (/supabase\.co\/storage\/v1\/object\/public\/media\/v25-images/i.test(url ?? "")) {
    score += 25;
  }
  if (ALLOWED_UNSPLASH_IDS.some((id) => (url ?? "").includes(id))) score += 15;
  if (/european|czech|eu clinic|latino|asian|north-american/i.test(blob)) score += 10;
  if (/african[\s-]?american|dark[\s-]?skinned hands|black hands clinical stock/i.test(blob)) {
    score -= 25;
  }
  if (isLaptopSceneHint(blob) && /medscope/i.test(url ?? "")) score += 30;
  if (isLaptopSceneHint(blob) && !/medscope/i.test(blob)) score -= 20;
  return score;
}

/** @deprecated Use ALL_BANNED_IDS — kept for bad-unsplash-ids compatibility */
export const BAD_UNSPLASH_IDS = ALL_BANNED_IDS;

export function hasBadUnsplashId(url) {
  return hasBannedCoverId(url);
}

export const EDITORIAL_IMAGE_POLICY_VERSION = "2026.08.29";
