/** Naturalize Czech medical/educational text for Web Speech API (spisovná čeština). */

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
  TNM: "T N M",
  HIV: "H I V",
  AIDS: "A I D S",
  COPD: "C O P D",
  CHOPN: "chronická obstrukční plicní nemoc",
  DM: "diabetes mellitus",
  HTN: "hypertenze",
  IV: "intravenózně",
  IM: "intramuskulárně",
  PO: "perorálně",
  MUDr: "mudr",
  MDDr: "mddr",
  PhDr: "phdr",
  RNDr: "rndr",
  MVDr: "mvdr",
  LF: "lékařská fakulta",
  NZIS: "národní zdravotnický informační systém",
  "MZČR": "ministerstvo zdravotnictví",
  MZCR: "ministerstvo zdravotnictví",
  "ÚZIS": "ústav zdravotnických informací a statistiky",
  "SÚKL": "státní ústav pro kontrolu léčiv",
  WHO: "světová zdravotnická organizace",
  JIP: "jednotka intenzivní péče",
  PZS: "poskytovatel zdravotních služeb",
};

/** Feminine cardinal forms used before letter designations (2b → dvě bé). */
const CZECH_DIGIT_SPOKEN: Record<string, string> = {
  "0": "nula",
  "1": "jedna",
  "2": "dvě",
  "3": "tři",
  "4": "čtyři",
  "5": "pět",
  "6": "šest",
  "7": "sedm",
  "8": "osm",
  "9": "devět",
  "10": "deset",
  "11": "jedenáct",
  "12": "dvanáct",
};

/** Czech letter names for medical staging (a → á, b → bé). */
const CZECH_LETTER: Record<string, string> = {
  a: "á",
  b: "bé",
  c: "cé",
  d: "dé",
  e: "e",
  f: "ef",
  g: "gé",
  h: "há",
  i: "í",
  j: "jé",
  k: "ká",
  l: "el",
  m: "em",
  n: "en",
  o: "o",
  p: "pé",
  q: "kvé",
  r: "er",
  s: "es",
  t: "té",
  u: "u",
  v: "vé",
  w: "dvojité vé",
  x: "iks",
  y: "ypsilon",
  z: "zet",
};

const PAUSE = "\u0000";

function speakDigit(n: string): string {
  if (CZECH_DIGIT_SPOKEN[n]) return CZECH_DIGIT_SPOKEN[n]!;
  return n
    .split("")
    .map((d) => CZECH_DIGIT_SPOKEN[d] ?? d)
    .join(" ");
}

function speakLetter(ch: string): string {
  return CZECH_LETTER[ch.toLowerCase()] ?? ch;
}

/** e.g. 2b → dvě bé, 3a → tři á, T2N1 → té dva en jedna */
function expandLetterNumberPatterns(text: string): string {
  let t = text;

  // Digit(s) + letter: 2b, 10a, stage IIIb handled separately
  t = t.replace(/\b(\d{1,2})([a-d])\b/gi, (_, num, letter) => {
    return `${speakDigit(num)} ${speakLetter(letter)}`;
  });

  // Letter + digit: a1, T1 (single letter prefix staging)
  t = t.replace(/\b([A-Za-z])(\d+)\b/g, (_, letter, num) => {
    const spokenLetter = speakLetter(letter);
    const spokenNum = num
      .split("")
      .map((d: string) => CZECH_DIGIT_SPOKEN[d] ?? d)
      .join(" ");
    return `${spokenLetter} ${spokenNum}`;
  });

  // Roman numerals with optional letter suffix: IIIb
  t = t.replace(/\b([IVXLC]+)([a-d])\b/gi, (_, roman, letter) => {
    return `${roman} ${speakLetter(letter)}`;
  });

  return t;
}

export function naturalizeCzechForSpeech(raw: string): string {
  let t = raw.replace(/\r/g, "").replace(/[#*]/g, " ");

  // Parentheses — brief pause, skip inner if very short abbrev
  t = t.replace(/\(([^)]+)\)/g, (_, inner) => {
    const trimmed = inner.trim();
    if (trimmed.length <= 6 && /^[A-Z0-9/]+$/i.test(trimmed)) return ` ${PAUSE} `;
    return ` ${PAUSE} ${trimmed} ${PAUSE} `;
  });

  // Letter+number medical staging before abbreviations
  t = expandLetterNumberPatterns(t);

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

  // Blood pressure / ratios: 120/80 → sto dvacet pause osmdesát
  t = t.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, (_, a, b) => {
    return `${speakDigit(a)} ${PAUSE} ${speakDigit(b)}`;
  });

  // Czech decimal numbers: 3,5 → tři celá pět
  t = t.replace(/\b(\d+),(\d+)\b/g, (_, whole, frac) => {
    return `${speakDigit(whole)} celá ${frac.split("").map((d: string) => CZECH_DIGIT_SPOKEN[d] ?? d).join(" ")}`;
  });

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
