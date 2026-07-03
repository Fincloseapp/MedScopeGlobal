/**
 * v25.2 AI Image Style Filter — neutral, European, professional; enforce fair-skinned gloved hands.
 */

const REJECT_PATTERNS = [
  /\bamerican\s+football\b/i,
  /\bbaseball\b/i,
  /\bnfl\b/i,
  /\bhollywood\b/i,
  /\bwild\s+west\b/i,
  /\bconfederate\b/i,
  /\btrump\b/i,
  /\bbiden\b/i,
  /\bpolitical\b/i,
  /\bparty\s+logo\b/i,
  /\bidentifiable\s+patient\b/i,
  /\breal\s+patient\s+photo\b/i,
  /\bgore\b/i,
  /\bexplicit\b/i,
  /\bnsfw\b/i,
  /\bselfie\b/i,
  /\bmeme\b/i,
  /\bemoji\b/i,
  /\bcartoon\s+character\b/i,
  /\bcaucasian\b/i,
  /\bafrican\s+american\b/i,
  /\basian\s+face\b/i,
  /\bafro\s+hair/i,
  /\bdark[\s-]?skinned\s+(?:person|patient|face|hands?)/i,
  /\bblack\s+hands?\b/i,
  /\bdark\s+hands?\b/i,
  /\bnon[\s-]?european\b/i,
  /\bus\s+hospital\b/i,
  /\bamerican\s+hospital\b/i,
  /\busa\s+clinic\b/i,
  /\bus\s+medical\s+center\b/i,
  /\bnon[\s-]?european\b/i,
  /\bbrown[\s-]?skinned\s+hands?\b/i,
];

function sanitizeForFilter(text) {
  return String(text ?? "")
    .replace(/no race or ethnicity descriptors/gi, "")
    .replace(/no race/gi, "")
    .replace(/without race/gi, "")
    .replace(/bez ras\w*/gi, "");
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
  /no\s+identifiable\s+faces?/i,
  /equipment[\s-]only/i,
];

const STYLE_GUIDE = {
  tone: "professional Czech medical editorial — educational-popular, engaging",
  avoid: "identifiable patient portraits, US-specific settings, political symbols, generic stock photo clichés, demographic stereotypes",
  palette: ["#021d33", "#0f3d5c", "#005B96", "#c5d9e8", "#f0f7ff", "#ffffff"],
  hands: "prefer medical equipment and diagrams; if hands visible use professional clinical gloves, no faces",
};

/**
 * @param {string} content - SVG markup or alt/prompt text
 * @param {{ alt?: string; prompt?: string; imageType?: string; requireHandsDirective?: boolean }} meta
 */
export function filterImageStyle(content, meta = {}) {
  const combined = sanitizeForFilter(`${content}\n${meta.alt ?? ""}\n${meta.prompt ?? ""}`);
  const rejected = REJECT_PATTERNS.filter((re) => re.test(combined)).map((re) => re.source);
  const warnings = [];

  if (/person|patient|doctor|nurse|student/i.test(combined) && /face|portrait|selfie|photo/i.test(combined)) {
    rejected.push("identifiable-person-photo");
  }

  if (/flag|banner|logo.*party|campaign/i.test(combined)) {
    rejected.push("political-branding");
  }

  const mentionsHands = /hands?|gloves?|fingers?|palms?/i.test(combined);
  const mentionsEquipment = /equipment|diagram|instrument|illustration/i.test(combined);
  const requireHands =
    meta.requireHandsDirective !== false &&
    mentionsHands &&
    !mentionsEquipment &&
    /photo|photorealistic/i.test(combined);
  if (requireHands && !HANDS_MARKERS.some((re) => re.test(combined))) {
    rejected.push("missing-clinical-imagery-directive");
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

/** Build safe generation prompt — European professional, fair-skinned hands when visible. */
export function buildSafePrompt({ title, topics, imageType, section, categoryExtra }) {
  const topicStr = (topics ?? []).slice(0, 4).join(", ");
  return [
    "Professional neutral European medical editorial imagery for Czech health magazine.",
    `Type: ${imageType ?? "illustration"}.`,
    `Section: ${section ?? "general"}.`,
    `Subject: ${title ?? "medical topic"}.`,
    topicStr ? `Themes: ${topicStr}.` : "",
    categoryExtra ?? "",
    "Clean modern European hospital or university environment, educational and engaging.",
    "Prefer medical equipment, anatomical diagrams, or gloved hands — avoid identifiable patient portraits.",
    "If human hands are visible: professional white clinical gloves in neutral medical context.",
    "Soft blue-teal palette (#021d33, #005B96), photorealistic or clean editorial illustration.",
    "MedScopeGlobal brand — trustworthy, popular-science, not stock-photo clichés.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function styleFilterMeta() {
  return { version: "v25.3", ...STYLE_GUIDE };
}
