/**
 * v25.2 AI Image Style Filter — Czech/EU medical editorial with autonomous policy gates.
 */
import {
  buildEditorialImageGuidance,
  isBannedCoverUrl,
  matchesBannedVisualKeyword,
  MEDSCOPE_SCREEN_BRANDING,
} from "../../editorial/image-policy.mjs";

const REJECT_PATTERNS = [
  /\bamerican\s+football\b/i,
  /\bbaseball\b/i,
  /\bnfl\b/i,
  /\bcowboy\b/i,
  /\bwild\s+west\b/i,
  /\bconfederate\b/i,
  /\btrump\b/i,
  /\bbiden\b/i,
  /\bpolitical\b/i,
  /\bparty\s+logo\b/i,
  /\breal\s+patient\s+photo\b/i,
  /\bgore\b/i,
  /\bexplicit\b/i,
  /\bnsfw\b/i,
  /\bselfie\b/i,
  /\bmeme\b/i,
  /\bemoji\b/i,
  /\bcartoon\s+character\b/i,
  /\bus\s+hospital\b/i,
  /\bamerican\s+hospital\b/i,
  /\busa\s+clinic\b/i,
  /\bus\s+medical\s+center\b/i,
  // Stereotypical stock tropes (editorial regional preference for CZ/EU magazine)
  /\bstereotypical\s+(?:african|black)\s+(?:medical|clinical)\s+stock\b/i,
  /\bdark[\s-]?skinned\s+hands?\s+(?:only\s+)?(?:close[\s-]?up|stock)\b/i,
  /\bblack\s+hands?\s+clinical\s+stock\b/i,
  // Hard visual ban: brain on a stick
  /\bbrain[\s_-]*on[\s_-]*(?:a[\s_-]*)?(?:stick|stand|skewer)\b/i,
  /\banatomical\s+brain\s+model\b/i,
  /\bplastic\s+brain\s+(?:model|prop)\b/i,
  /\bmozku?\s+na\s+ty/i,
];

/**
 * Strip avoidance / brand-safety phrasing so the filter does not reject its own
 * safe prompts (e.g. "avoid identifiable patient portraits").
 */
function sanitizeForFilter(text) {
  return String(text ?? "")
    .replace(/no race or ethnicity descriptors/gi, "")
    .replace(/no race/gi, "")
    .replace(/without race/gi, "")
    .replace(/bez ras\w*/gi, "")
    .replace(
      /\b(?:avoid|no|without|not|never)\s+(?:identifiable\s+)?(?:patient\s+)?(?:portraits?|faces?|photos?)\b/gi,
      ""
    )
    .replace(/\b(?:avoid|no|without)\s+identifiable\s+patient(?:\s+portraits?)?\b/gi, "")
    .replace(/\bno\s+identifiable\s+faces?\b/gi, "")
    .replace(/\b(?:prefer|use)\s+medical\s+equipment[^.]*\./gi, "medical equipment. ")
    .replace(/\bdemographic\s+stereotypes?\b/gi, "")
    .replace(/\bgeneric\s+stock\s+photo\s+clich[eé]s?\b/gi, "")
    .replace(/\bminimize:\s*[^.]*\./gi, "")
    .replace(/\bstereotypical stock tropes[^.]*\./gi, "");
}

const REQUIRED_STYLE_MARKERS = [
  "professional",
  "neutral",
  "european",
  "medical",
  "MedScopeGlobal",
];

const HANDS_MARKERS = [
  /clinical\s+gloves?/i,
  /gloved\s+hands?/i,
  /medical\s+equipment/i,
  /anatomical\s+diagram/i,
  /equipment[\s-]only/i,
];

const STYLE_GUIDE = {
  tone: "professional Czech medical editorial — educational-popular, engaging",
  avoid:
    "identifiable patient portraits, US-specific settings, political symbols, generic stock photo clichés, plastic brain-on-stick props, stereotypical non-EU clinical-hand stock tropes",
  palette: ["#021d33", "#0f3d5c", "#005B96", "#c5d9e8", "#f0f7ff", "#ffffff"],
  hands: "prefer medical equipment and diagrams; if hands visible use professional clinical gloves, no faces",
  audience:
    "European, Latino, Asian, and American presentation for a Czech/EU magazine — regional editorial relevance, not demographic exclusion",
  screenBranding: MEDSCOPE_SCREEN_BRANDING,
};

/**
 * @param {string} content - SVG markup or alt/prompt text
 * @param {{ alt?: string; prompt?: string; imageType?: string; requireHandsDirective?: boolean; url?: string }} meta
 */
export function filterImageStyle(content, meta = {}) {
  const combined = sanitizeForFilter(`${content}\n${meta.alt ?? ""}\n${meta.prompt ?? ""}`);
  const rejected = REJECT_PATTERNS.filter((re) => re.test(combined)).map((re) => re.source);
  const warnings = [];

  if (meta.url && isBannedCoverUrl(meta.url)) {
    rejected.push("banned-cover-url");
  }
  if (matchesBannedVisualKeyword(combined)) {
    rejected.push("banned-visual-fingerprint");
  }

  // Reject only when the prompt asks for a person face/portrait — not when mentioning patients clinically.
  const asksForFace =
    /\b(?:close[\s-]?up\s+)?(?:face\s+portrait|portrait\s+of|headshot|selfie)\b/i.test(combined) ||
    /\b(?:show|include|depict|photograph)\s+(?:a\s+)?(?:patient|doctor|nurse|student)\s+(?:face|portrait)\b/i.test(
      combined
    );
  if (asksForFace) {
    rejected.push("identifiable-person-photo");
  }

  if (/\b(?:party\s+)?flag\b/i.test(combined) || /\bcampaign\s+(?:banner|logo)\b/i.test(combined)) {
    rejected.push("political-branding");
  }

  const mentionsHands = /hands?|gloves?|fingers?|palms?/i.test(combined);
  const mentionsEquipment = /equipment|diagram|instrument|illustration/i.test(combined);
  const requireHands =
    meta.requireHandsDirective === true &&
    mentionsHands &&
    !mentionsEquipment &&
    /photo|photorealistic/i.test(combined);
  if (requireHands && !HANDS_MARKERS.some((re) => re.test(combined))) {
    rejected.push("missing-clinical-imagery-directive");
  }

  const mentionsScreen = /laptop|notebook|monitor|tablet|screen|obrazovk|po[cč]íta[cč]/i.test(combined);
  if (mentionsScreen && !/medscopeglobal|medscope/i.test(combined)) {
    warnings.push("laptop-scene-missing-medscope-branding");
  }

  const passed = rejected.length === 0;
  return {
    passed,
    rejected,
    warnings,
    styleGuide: STYLE_GUIDE,
    requiredMarkers: REQUIRED_STYLE_MARKERS,
  };
}

/** Build safe generation prompt — European professional, thematic alignment with article. */
export function buildSafePrompt({ title, topics, imageType, section, categoryExtra, excerpt }) {
  const topicStr = (topics ?? []).slice(0, 5).join(", ");
  return [
    "Professional neutral European medical editorial imagery for Czech health magazine MedScopeGlobal.",
    `Type: ${imageType ?? "illustration"}.`,
    `Section: ${section ?? "general"}.`,
    `Article title (visual must reflect this topic): ${title ?? "medical topic"}.`,
    excerpt ? `Article context: ${String(excerpt).slice(0, 180)}.` : "",
    topicStr ? `Key themes to visualize: ${topicStr}.` : "",
    categoryExtra ?? "",
    "The image MUST clearly relate to the article subject — not generic medical stock.",
    "Clean modern European hospital or university environment, educational and engaging.",
    "Prefer medical equipment, anatomical diagrams, or gloved hands — avoid identifiable patient portraits.",
    "If human hands are visible: professional white clinical gloves in neutral medical context.",
    "Soft blue-teal palette (#021d33, #005B96), photorealistic or clean editorial illustration.",
    "MedScopeGlobal brand — trustworthy, popular-science, not stock-photo clichés.",
    buildEditorialImageGuidance(),
  ]
    .filter(Boolean)
    .join(" ");
}

export function styleFilterMeta() {
  return { version: "v25.5-editorial-policy", ...STYLE_GUIDE };
}
