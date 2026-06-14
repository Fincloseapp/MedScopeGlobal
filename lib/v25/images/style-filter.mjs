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
  /\bdark[\s-]?skinned\s+(?:person|patient|face)/i,
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
  /white[\s-]?skinned\s+hands?/i,
  /fair[\s-]?skinned\s+hands?/i,
  /white\s+clinical\s+gloves?/i,
  /european\s+hands?/i,
  /gloved\s+hands?/i,
];

const STYLE_GUIDE = {
  tone: "neutral professional European medical editorial",
  avoid: "demographic stereotypes, US-specific settings, political symbols, identifiable patients, dark-skinned or non-European hands",
  palette: ["#021d33", "#0f3d5c", "#c5d9e8", "#f0f7ff", "#ffffff"],
  hands: "white-skinned or fair-skinned European hands only; white clinical gloves when hands are visible",
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
  const requireHands = meta.requireHandsDirective !== false && (mentionsHands || /photo|photorealistic/i.test(combined));
  if (requireHands && !HANDS_MARKERS.some((re) => re.test(combined))) {
    rejected.push("missing-european-hands-directive");
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
    "Professional neutral European medical editorial imagery.",
    `Type: ${imageType ?? "illustration"}.`,
    `Section: ${section ?? "general"}.`,
    `Subject: ${title ?? "medical topic"}.`,
    topicStr ? `Themes: ${topicStr}.` : "",
    categoryExtra ?? "",
    "Clean modern European hospital or university environment, trustworthy and academic.",
    "If human hands are visible: white-skinned European hands only, wearing white clinical gloves.",
    "No identifiable faces, no demographic stereotypes, no US-specific settings.",
    "Soft blue palette, photorealistic or clean editorial style.",
    "MedScopeGlobal brand tone.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function styleFilterMeta() {
  return { version: "v25.2", ...STYLE_GUIDE };
}
