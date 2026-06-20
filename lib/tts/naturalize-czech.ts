/** Naturalize Czech medical/educational text for Web Speech API (human-like, not robotic). */

const MEDICAL_ABBR: Record<string, string> = {
  EKG: "E K G",
  ECG: "E C G",
  TK: "tlak krve",
  RR: "dechová frekvence",
  SpO2: "saturace kyslíku",
  CO2: "oxid uhličitý",
  O2: "kyslík",
  mg: "miligramů",
  kg: "kilogramů",
  ml: "mililitrů",
  "mg/kg": "miligramů na kilogram",
  mmHg: "milimetrů rtuťového sloupce",
  bpm: "úderů za minutu",
};

const PAUSE = "\u0000";

export function naturalizeCzechForSpeech(raw: string): string {
  let t = raw.replace(/\r/g, "").replace(/[#*]/g, " ");

  // Parentheses — brief pause, skip inner if very short abbrev
  t = t.replace(/\(([^)]+)\)/g, (_, inner) => {
    const trimmed = inner.trim();
    if (trimmed.length <= 6 && /^[A-Z0-9/]+$/i.test(trimmed)) return ` ${PAUSE} `;
    return ` ${PAUSE} ${trimmed} ${PAUSE} `;
  });

  // Slashes between words → pause (not "lomítko")
  t = t.replace(/\s+\/\s+/g, ` ${PAUSE} `);
  t = t.replace(/(\w)\/(\w)/g, `$1 ${PAUSE} $2`);

  // Dashes → pause
  t = t.replace(/\s*[–—-]\s*/g, ` ${PAUSE} `);

  // Medical abbreviations (longer first)
  for (const [abbr, spoken] of Object.entries(MEDICAL_ABBR).sort((a, b) => b[0].length - a[0].length)) {
    const re = new RegExp(`\\b${abbr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    t = t.replace(re, spoken);
  }

  // Numbers with units: 120/80 → 120 pause 80
  t = t.replace(/(\d+)\s*\/\s*(\d+)/g, `$1 ${PAUSE} $2`);

  // Collapse whitespace
  t = t.replace(/\s+/g, " ").trim();

  return t;
}

/** Split naturalized text into speakable utterances (pause markers = separate chunks). */
export function splitIntoUtterances(naturalized: string): string[] {
  return naturalized
    .split(PAUSE)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

export function naturalizeAndSplit(raw: string): string[] {
  return splitIntoUtterances(naturalizeCzechForSpeech(raw));
}

export const SLIDE_PAUSE_MS = 400;
