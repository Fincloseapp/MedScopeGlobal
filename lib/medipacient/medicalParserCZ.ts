/**
 * Rule-based Czech medical-report parser.
 * Runs after OCR/AI so structured fields exist even when LLM JSON is incomplete.
 * Prefer explicit calendar dates over relative phrases.
 */

export type LabValue = {
  name: string;
  value: number;
  unit: string;
  raw: string;
  ref?: string;
};

export type RecommendationKind = "referral" | "imaging" | "control" | "gp" | "other";

export type Recommendation = {
  text: string;
  kind: RecommendationKind;
  target?: string;
};

export type VisitPlanSource = "explicit" | "relative" | "month_name";

export type VisitPlan = {
  date: Date | null;
  originalText: string;
  where: string | null;
  intervalMonths: number | null;
  repeating: boolean;
  source: VisitPlanSource;
};

export type VisitPlanStored = {
  dateIso: string | null;
  originalText: string;
  where: string | null;
  intervalMonths: number | null;
  repeating: boolean;
  source: VisitPlanSource;
};

export type ParserOptions = {
  now?: Date;
  /** Report / CURRENT_DATE (Europe/Prague). ISO YYYY-MM-DD or Date. */
  reportDate?: Date | string | null;
};

export const CZECH_MEDICAL_ABBREVIATIONS: Record<string, string> = {
  ALT: "alaninaminotransferáza (ALT)",
  AST: "aspartátaminotransferáza (AST)",
  KO: "krevní obraz (KO)",
  CRP: "C-reaktivní protein (CRP)",
  TK: "krevní tlak (TK)",
  DM: "cukrovka — diabetes mellitus (DM)",
  CHOPN: "chronická obstrukční plicní nemoc (CHOPN)",
  FW: "sedimentace erytrocytů (FW)",
  GGT: "gamaglutamyltransferáza (GGT)",
  GMT: "gamaglutamyltransferáza (GMT/GGT)",
  LD: "laktátdehydrogenáza (LD)",
  LDH: "laktátdehydrogenáza (LDH)",
  urea: "močovina (urea)",
  kreatinin: "kreatinin",
  "HbA1c": "glykovaný hemoglobin (HbA1c)",
  TSH: "tyreostimulační hormon (TSH)",
  T4: "tyroxin (T4)",
  fT4: "volný tyroxin (fT4)",
  T3: "trijodtyronin (T3)",
  INR: "mezinárodní normalizovaný poměr srážlivosti (INR)",
  APTT: "aktivovaný parciální tromboplastinový čas (APTT)",
  Leu: "leukocyty — bílé krvinky (Leu)",
  Ery: "erytrocyty — červené krvinky (Ery)",
  Hb: "hemoglobin (Hb)",
  Hct: "hematokrit (Hct)",
  HCT: "hematokrit (Hct)",
  Tr: "trombocyty — krevní destičky (Tr)",
  PLT: "trombocyty — krevní destičky (PLT)",
  glykemie: "hladina cukru v krvi (glykemie)",
  glukóza: "hladina cukru v krvi (glukóza)",
  RTG: "rentgen (RTG)",
  CT: "výpočetní tomografie (CT)",
  MR: "magnetická rezonance (MR)",
  MRI: "magnetická rezonance (MRI)",
  UZ: "ultrazvuk (UZ)",
  sono: "ultrazvuk (sono)",
  EKG: "elektrokardiogram (EKG)",
  EEG: "elektroencefalogram (EEG)",
  PL: "praktický lékař (PL)",
  VPL: "všeobecný praktický lékař (VPL)",
  LDL: "LDL cholesterol",
  HDL: "HDL cholesterol",
  FWGgt: "sedimentace",
};

const MONTHS: Array<[RegExp, number]> = [
  [/ledn/i, 0],
  [/unor/i, 1],
  [/brezn/i, 2],
  [/dubn/i, 3],
  [/kvetn/i, 4],
  [/cervenc/i, 6],
  [/cervn/i, 5],
  [/srpn/i, 7],
  [/zari/i, 8],
  [/rijn/i, 9],
  [/listopad/i, 10],
  [/prosinc/i, 11],
];

const LAB_CANON: Array<{ re: RegExp; name: string; defaultUnit: string }> = [
  { re: /\bCRP\b/i, name: "CRP", defaultUnit: "mg/l" },
  { re: /\bALT\b/i, name: "ALT", defaultUnit: "ukat/l" },
  { re: /\bAST\b/i, name: "AST", defaultUnit: "ukat/l" },
  { re: /\bGGT\b|\bGMT\b/i, name: "GGT", defaultUnit: "ukat/l" },
  { re: /\bLDH?\b/i, name: "LD", defaultUnit: "ukat/l" },
  { re: /\bHbA1c\b/i, name: "HbA1c", defaultUnit: "mmol/mol" },
  { re: /\bTSH\b/i, name: "TSH", defaultUnit: "mIU/l" },
  { re: /\bf?T4\b/i, name: "T4", defaultUnit: "pmol/l" },
  { re: /\bINR\b/i, name: "INR", defaultUnit: "" },
  { re: /\bAPTT\b/i, name: "APTT", defaultUnit: "s" },
  { re: /\bLeu\b|leukocyt/i, name: "Leu", defaultUnit: "10^9/l" },
  { re: /\bEry\b|erytrocyt/i, name: "Ery", defaultUnit: "10^12/l" },
  { re: /\bHct\b|\bHCT\b|hematokrit/i, name: "Hct", defaultUnit: "%" },
  { re: /\bHb\b|hemoglobin/i, name: "Hb", defaultUnit: "g/l" },
  { re: /\bTr\b|\bPLT\b|trombocyt/i, name: "Tr", defaultUnit: "10^9/l" },
  { re: /\burea\b|mocovina/i, name: "urea", defaultUnit: "mmol/l" },
  { re: /kreatinin/i, name: "kreatinin", defaultUnit: "umol/l" },
  { re: /glykemie|glykémie|gluk[oó]za/i, name: "glykemie", defaultUnit: "mmol/l" },
  { re: /\bFW\b|sedimentac/i, name: "FW", defaultUnit: "mm/h" },
  { re: /\bLDL\b/i, name: "LDL", defaultUnit: "mmol/l" },
  { re: /\bHDL\b/i, name: "HDL", defaultUnit: "mmol/l" },
];

const SPECIALIST_TARGETS: Array<[RegExp, string]> = [
  [/neurolog/i, "neurologie"],
  [/kardiolog/i, "kardiologie"],
  [/internist|intern[ií]/i, "interna"],
  [/ortoped/i, "ortopedie"],
  [/chirurg/i, "chirurgie"],
  [/o[cč]n[ií]|oftalmolog/i, "oční"],
  [/orl|otorinolaryng/i, "ORL"],
  [/urolog/i, "urologie"],
  [/gynekolog/i, "gynekologie"],
  [/dermatolog|ko[zž]n/i, "dermatologie"],
  [/endokrinolog/i, "endokrinologie"],
  [/diabetolog/i, "diabetologie"],
  [/pneumolog|plicn/i, "pneumologie"],
  [/nefrolog/i, "nefrologie"],
  [/gastroenterolog/i, "gastroenterologie"],
  [/psychiatr/i, "psychiatrie"],
  [/rehabilit/i, "rehabilitace"],
  [/fyzioter/i, "fyzioterapie"],
];

const IMAGING_TARGETS: Array<[RegExp, string]> = [
  [/\bRTG\b|rentgen/i, "RTG"],
  [/\bCT\b/i, "CT"],
  [/\bMRI?\b|magnetick/i, "MR"],
  [/\bUZ\b|sono|ultrazvuk/i, "UZ"],
  [/EKG/i, "EKG"],
  [/EEG/i, "EEG"],
];

export function foldCzech(text: string): string {
  return (text || "")
    .replace(/µ|μ/g, "u")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function pragueTodayIso(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function toUtcNoon(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function isoUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseIsoOrCzDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return isoUtc(value);
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dotted = raw.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/);
  if (dotted) {
    return `${dotted[3]}-${dotted[2].padStart(2, "0")}-${dotted[1].padStart(2, "0")}`;
  }
  const slashed = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashed) {
    return `${slashed[3]}-${slashed[2].padStart(2, "0")}-${slashed[1].padStart(2, "0")}`;
  }
  return null;
}

function addDays(startIso: string, days: number): Date {
  const d = toUtcNoon(startIso);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addMonths(startIso: string, months: number): Date {
  const [y0, m0, day] = startIso.split("-").map(Number);
  const year = y0 + Math.floor((m0 - 1 + months) / 12);
  const month = (m0 - 1 + months) % 12;
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, last), 12, 0, 0));
}

function referenceIso(opts?: ParserOptions): string {
  const fromReport = parseIsoOrCzDate(opts?.reportDate ?? null);
  if (fromReport) return fromReport;
  return pragueTodayIso(opts?.now);
}

function cite(text: string, index: number, span = 80): string {
  const start = Math.max(0, index - 8);
  return text.slice(start, index + span).replace(/\s+/g, " ").trim().slice(0, 160);
}

function parseNumber(raw: string): number | null {
  const n = Number(raw.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) ? n : null;
}

function normalizeUnit(unit: string): string {
  return unit
    .replace(/µ|μ/g, "u")
    .replace(/\s+/g, "")
    .replace(/litr/i, "l")
    .toLowerCase();
}

/** Expand Czech medical abbreviations for seniors — keeps original in parentheses via dictionary. */
export function normalizeCzechMedicalTerms(text: string): string {
  let out = text || "";
  const keys = Object.keys(CZECH_MEDICAL_ABBREVIATIONS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const label = CZECH_MEDICAL_ABBREVIATIONS[key];
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(key)}(?![\\p{L}\\p{N}])`, "giu");
    out = out.replace(re, (match) => {
      if (out.includes(label)) return match;
      return label;
    });
  }
  return out;
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractLabValues(text: string): LabValue[] {
  const source = text || "";
  const found: LabValue[] = [];
  const seen = new Set<string>();

  const pairRe =
    /\b(CRP|ALT|AST|GGT|GMT|LDH?|HbA1c|TSH|f?T4|INR|APTT|Leu|Ery|Hct|HCT|Hb|Tr|PLT|urea|kreatinin|glykemie|glykémie|gluk[oó]za|FW|LDL|HDL)\b[^0-9]{0,12}(\d+(?:[.,]\d+)?)\s*([µμu]?kat\/l|ukat\/l|mg\/l|mmol\/mol|mmol\/l|umol\/l|µmol\/l|μmol\/l|g\/l|mm\/h|mIU\/l|pmol\/l|s|%|10\^9\/l|10\^12\/l)?/gi;

  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(source))) {
    const value = parseNumber(m[2]);
    if (value == null) continue;
    const canon = LAB_CANON.find((item) => item.re.test(m![1]));
    const name = canon?.name || m[1];
    let unit = normalizeUnit(m[3] || canon?.defaultUnit || "");
    if (unit === "ukat/l" || unit === "ukat/l") unit = "ukat/l";
    const key = `${name}:${value}:${unit}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      name,
      value,
      unit,
      raw: m[0].replace(/\s+/g, " ").trim(),
    });
  }

  const tk = source.match(/\bTK\b[^0-9]{0,8}(\d{2,3})\s*\/\s*(\d{2,3})/i);
  if (tk) {
    const sys = parseNumber(tk[1]);
    if (sys != null) {
      found.push({
        name: "TK",
        value: sys,
        unit: "mmHg",
        raw: tk[0].replace(/\s+/g, " ").trim(),
      });
    }
  }

  return found;
}

function specialistFrom(blob: string): string | null {
  for (const [re, label] of SPECIALIST_TARGETS) {
    if (re.test(blob)) return label;
  }
  return null;
}

function imagingFrom(blob: string): string | null {
  for (const [re, label] of IMAGING_TARGETS) {
    if (re.test(blob)) return label;
  }
  return null;
}

export function extractRecommendations(text: string): Recommendation[] {
  const source = text || "";
  const recs: Recommendation[] = [];
  const seen = new Set<string>();

  const push = (item: Recommendation) => {
    const key = `${item.kind}:${(item.target || item.text).toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    recs.push({ ...item, text: item.text.replace(/\s+/g, " ").trim().slice(0, 240) });
  };

  const lines = source.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  const hay = [source, ...lines];

  for (const chunk of hay) {
    const folded = foldCzech(chunk);

    if (/odesla[nna]|objedna[nt]|indikova[nna]/.test(folded) && imagingFrom(chunk)) {
      const target = imagingFrom(chunk)!;
      push({
        text: chunk.match(/[^.!\n]{0,40}(RTG|CT|MR|UZ|sono|rentgen|ultrazvuk)[^.!\n]{0,40}/i)?.[0] || `Odeslán na ${target}`,
        kind: "imaging",
        target,
      });
    }

    if (/doporuc/.test(folded) && imagingFrom(chunk)) {
      const target = imagingFrom(chunk)!;
      push({
        text: chunk.match(/doporuč[^.\n]{0,80}/i)?.[0] || `Doporučeno vyšetření: ${target}`,
        kind: "imaging",
        target,
      });
    }

    if (
      /doporuc/.test(folded) &&
      specialistFrom(chunk) &&
      !/kontrola u/.test(folded)
    ) {
      const target = specialistFrom(chunk)!;
      push({
        text: chunk.match(/doporuč[^.\n]{0,90}/i)?.[0] || `Doporučuji ${target}`,
        kind: "referral",
        target,
      });
    }

    if (/odesla[nna] (ke? |na |k )/.test(folded) && specialistFrom(chunk)) {
      const target = specialistFrom(chunk)!;
      push({
        text: chunk.match(/odeslá[^.!\n]{0,80}/i)?.[0] || `Odeslán k ${target}`,
        kind: "referral",
        target,
      });
    }

    if (
      /kontrola u praktick|u praktickeho lekare|u pl\b|praktick[eé]ho l[eé]ka[rř]e|vpl\b/.test(
        folded,
      )
    ) {
      push({
        text:
          chunk.match(/kontrola u[^.\n]{0,60}/i)?.[0] ||
          "Kontrola u praktického lékaře",
        kind: "gp",
        target: "praktický lékař",
      });
    }

    if (/kontrola u /.test(folded) && specialistFrom(chunk)) {
      const target = specialistFrom(chunk)!;
      push({
        text: chunk.match(/kontrola u[^.\n]{0,70}/i)?.[0] || `Kontrola u ${target}`,
        kind: "control",
        target,
      });
    }
  }

  return recs;
}

function extractExplicitDateNearControl(text: string): { date: Date; original: string } | null {
  const re =
    /((?:p[rř][ií][sš]t[ií]\s+n[aá]v[sš]t[eě]va|p[rř][ií][sš]t[ií]\s+kontrola|kontrola|n[aá]v[sš]t[eě]va|kontrolu)[^\d]{0,28})(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/gi;
  let m: RegExpExecArray | null;
  let last: { date: Date; original: string } | null = null;
  while ((m = re.exec(text))) {
    const iso = parseIsoOrCzDate(`${m[2]}.${m[3]}.${m[4]}`);
    if (!iso) continue;
    last = { date: toUtcNoon(iso), original: m[0].replace(/\s+/g, " ").trim() };
  }
  if (last) return last;

  const loose = text.match(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\b/);
  const around = loose
    ? text.slice(Math.max(0, (loose.index || 0) - 40), (loose.index || 0) + 40)
    : "";
  if (loose && /kontrola|návštěva|navsteva|termín|termin/i.test(around)) {
    const iso = parseIsoOrCzDate(loose[0]);
    if (iso) return { date: toUtcNoon(iso), original: loose[0] };
  }
  return null;
}

function extractRelative(text: string, refIso: string): { date: Date; original: string; months: number | null } | null {
  const folded = foldCzech(text);
  const original = text;

  const pickCite = (re: RegExp) => {
    const m = original.match(re) || text.match(re);
    return m?.[0]?.replace(/\s+/g, " ").trim() || "";
  };

  const days = folded.match(/za\s+(\d+)\s+(den|dny|dnu|dni)/);
  if (days) {
    return {
      date: addDays(refIso, Number(days[1])),
      original: pickCite(/za\s+\d+\s+(den|dny|dnů|dní)/i),
      months: null,
    };
  }
  if (/\bza\s+tyden\b/.test(folded)) {
    return { date: addDays(refIso, 7), original: pickCite(/za\s+týden/i), months: null };
  }
  const weeks = folded.match(/za\s+(\d+)\s+(tyden|tydny|tydnu)/);
  if (weeks) {
    return {
      date: addDays(refIso, Number(weeks[1]) * 7),
      original: pickCite(/za\s+\d+\s+(týden|týdny|týdnů)/i),
      months: null,
    };
  }
  if (/\bza\s+mesic\b/.test(folded)) {
    return { date: addMonths(refIso, 1), original: pickCite(/za\s+měsíc/i), months: 1 };
  }
  const months = folded.match(/za\s+(\d+)\s+(mesic|mesice|mesicu)/);
  if (months) {
    const n = Number(months[1]);
    return {
      date: addMonths(refIso, n),
      original: pickCite(/za\s+\d+\s+(měsíc|měsíce|měsíců)/i),
      months: n,
    };
  }
  if (/\bza\s+rok\b/.test(folded)) {
    return { date: addMonths(refIso, 12), original: pickCite(/za\s+rok/i), months: 12 };
  }
  const years = folded.match(/za\s+(\d+)\s+(rok|roky|let)/);
  if (years) {
    const n = Number(years[1]) * 12;
    return { date: addMonths(refIso, n), original: pickCite(/za\s+\d+\s+(rok|roky|let)/i), months: n };
  }
  return null;
}

function extractMonthName(text: string, refIso: string): { date: Date; original: string } | null {
  const folded = foldCzech(text);
  if (!/kontrol|navstev|doporuc/.test(folded)) return null;
  for (const [re, month] of MONTHS) {
    const m = folded.match(new RegExp(`(?:v|na)\\s+${re.source}\\w*`, "i"));
    if (!m) continue;
    const yearHit = folded.match(new RegExp(`${re.source}\\w*\\s+(\\d{4})`, "i"));
    const [ry, rm] = refIso.split("-").map(Number);
    let year = yearHit ? Number(yearHit[1]) : ry;
    if (!yearHit && month < rm - 1) year += 1;
    const original = text.match(/(?:v|na)\s+\w+/i)?.[0] || m[0];
    return { date: new Date(Date.UTC(year, month, 1, 12, 0, 0)), original };
  }
  return null;
}

function extractWhere(text: string): string | null {
  const gp = text.match(/u praktick[^.\n]{0,40}/i);
  if (gp) return gp[0].trim();
  const spec = specialistFrom(text);
  if (spec && /kontrola u|u /i.test(text)) return spec;
  return spec;
}

function extractInterval(text: string): { months: number; repeating: boolean } | null {
  const folded = foldCzech(text);
  const every = folded.match(/(?:kazd[ey]\s+|a\s+|á\s+)(\d+)\s+(mesic|mesice|mesicu)/);
  if (every) return { months: Number(every[1]), repeating: true };
  const za = folded.match(/za\s+(\d+)\s+(mesic|mesice|mesicu)/);
  if (za && /pravidel|opak|dlouhodob|chronic/i.test(folded)) {
    return { months: Number(za[1]), repeating: true };
  }
  return null;
}

export function detectNextVisit(text: string, opts?: ParserOptions): VisitPlan | null {
  const source = text || "";
  if (!source.trim()) return null;
  const refIso = referenceIso(opts);
  const interval = extractInterval(source);
  const where = extractWhere(source);

  const explicit = extractExplicitDateNearControl(source);
  if (explicit) {
    return {
      date: explicit.date,
      originalText: explicit.original,
      where,
      intervalMonths: interval?.months ?? null,
      repeating: interval?.repeating ?? false,
      source: "explicit",
    };
  }

  const relative = extractRelative(source, refIso);
  if (relative && /kontrol|navstev|doporuc|pristi/i.test(foldCzech(source))) {
    return {
      date: relative.date,
      originalText: relative.original || cite(source, 0),
      where,
      intervalMonths: interval?.months ?? relative.months,
      repeating: interval?.repeating ?? false,
      source: "relative",
    };
  }

  const month = extractMonthName(source, refIso);
  if (month) {
    return {
      date: month.date,
      originalText: month.original,
      where,
      intervalMonths: interval?.months ?? null,
      repeating: interval?.repeating ?? false,
      source: "month_name",
    };
  }

  if (relative) {
    return {
      date: relative.date,
      originalText: relative.original,
      where,
      intervalMonths: interval?.months ?? relative.months,
      repeating: interval?.repeating ?? false,
      source: "relative",
    };
  }

  return null;
}

export function extractControlDate(text: string, opts?: ParserOptions): Date | null {
  return detectNextVisit(text, opts)?.date ?? null;
}

export function storeVisitPlan(plan: VisitPlan | null): VisitPlanStored | null {
  if (!plan) return null;
  return {
    dateIso: plan.date ? isoUtc(plan.date) : null,
    originalText: plan.originalText,
    where: plan.where,
    intervalMonths: plan.intervalMonths,
    repeating: plan.repeating,
    source: plan.source,
  };
}

export function visitPlanFromStored(plan: VisitPlanStored | null | undefined): VisitPlan | null {
  if (!plan) return null;
  return {
    date: plan.dateIso ? toUtcNoon(plan.dateIso) : null,
    originalText: plan.originalText,
    where: plan.where,
    intervalMonths: plan.intervalMonths,
    repeating: plan.repeating,
    source: plan.source,
  };
}

function asLabList(raw: unknown): LabValue[] {
  if (!Array.isArray(raw)) return [];
  const out: LabValue[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const value = typeof rec.value === "number" ? rec.value : parseNumber(String(rec.value ?? ""));
    const name = String(rec.name || "").trim();
    if (!name || value == null) continue;
    out.push({
      name,
      value,
      unit: String(rec.unit || ""),
      raw: String(rec.raw || `${name} ${value}`),
      ref: rec.ref ? String(rec.ref) : undefined,
    });
  }
  return out;
}

function asRecList(raw: unknown): Recommendation[] {
  if (!Array.isArray(raw)) return [];
  const out: Recommendation[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push({ text: item.trim(), kind: "other" });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const text = String(rec.text || "").trim();
    if (!text) continue;
    const kind = String(rec.kind || "other") as RecommendationKind;
    out.push({
      text,
      kind: ["referral", "imaging", "control", "gp", "other"].includes(kind) ? kind : "other",
      target: rec.target ? String(rec.target) : undefined,
    });
  }
  return out;
}

function mergeLabs(parser: LabValue[], ai: LabValue[]): LabValue[] {
  const byName = new Map<string, LabValue>();
  for (const lab of [...ai, ...parser]) {
    const key = lab.name.toLowerCase();
    const prev = byName.get(key);
    if (!prev) {
      byName.set(key, lab);
      continue;
    }
    if (parser.includes(lab)) byName.set(key, lab);
  }
  return [...byName.values()];
}

function mergeRecs(parser: Recommendation[], ai: Recommendation[]): Recommendation[] {
  const seen = new Set<string>();
  const out: Recommendation[] = [];
  for (const rec of [...parser, ...ai]) {
    const key = `${rec.kind}:${foldCzech(rec.target || rec.text).slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(rec);
  }
  return out.slice(0, 16);
}

export type ParserMergeInput = {
  text: string;
  currentDate: string;
  aiControlIso?: string | null;
  aiControlText?: string;
  aiLabs?: unknown;
  aiRecommendations?: unknown;
  aiVisit?: Partial<VisitPlanStored> | null;
};

export type ParserMergeResult = {
  labValues: LabValue[];
  recommendations: Recommendation[];
  visitPlan: VisitPlanStored | null;
  controlDate: string | null;
  controlOriginal: string;
  preferredExplicit: boolean;
};

/** Merge rule parser + AI. Explicit calendar dates win over relative phrases. */
export function mergeAiWithParser(input: ParserMergeInput): ParserMergeResult {
  const opts: ParserOptions = { reportDate: input.currentDate };
  const visit = detectNextVisit(input.text, opts);
  const labs = mergeLabs(extractLabValues(input.text), asLabList(input.aiLabs));
  const recs = mergeRecs(extractRecommendations(input.text), asRecList(input.aiRecommendations));
  const stored = storeVisitPlan(visit);
  const aiIso = parseIsoOrCzDate(input.aiControlIso || input.aiVisit?.dateIso || null);
  const parserIso = stored?.dateIso || null;

  let controlDate: string | null = null;
  let controlOriginal = "";
  let preferredExplicit = false;

  if (visit?.source === "explicit" && parserIso) {
    controlDate = parserIso;
    controlOriginal = visit.originalText;
    preferredExplicit = true;
  } else if (aiIso && input.aiVisit?.source === "explicit") {
    controlDate = aiIso;
    controlOriginal = input.aiControlText || input.aiVisit.originalText || "";
  } else if (visit?.source === "explicit" && parserIso) {
    controlDate = parserIso;
    controlOriginal = visit.originalText;
    preferredExplicit = true;
  } else if (parserIso && visit?.source === "explicit") {
    controlDate = parserIso;
    controlOriginal = visit.originalText;
    preferredExplicit = true;
  } else if (aiIso && visit?.source !== "explicit") {
    // Prefer parser explicit already handled; otherwise keep AI ISO if parser is only relative
    // but if parser has a date too, still prefer parser when it is explicit — else parser relative.
    controlDate = parserIso || aiIso;
    controlOriginal = visit?.originalText || input.aiControlText || "";
    if (parserIso) controlDate = parserIso;
  } else {
    controlDate = parserIso || aiIso;
    controlOriginal = visit?.originalText || input.aiControlText || "";
  }

  if (visit?.source === "explicit" && parserIso) {
    controlDate = parserIso;
    controlOriginal = visit.originalText;
    preferredExplicit = true;
  }

  const visitPlan: VisitPlanStored | null = stored
    ? { ...stored, dateIso: controlDate, originalText: controlOriginal || stored.originalText }
    : controlDate
      ? {
          dateIso: controlDate,
          originalText: controlOriginal,
          where: extractWhere(input.text),
          intervalMonths: null,
          repeating: false,
          source: preferredExplicit ? "explicit" : "relative",
        }
      : null;

  return {
    labValues: labs,
    recommendations: recs,
    visitPlan,
    controlDate,
    controlOriginal,
    preferredExplicit,
  };
}

export function recommendationLabelsCs(recs: Recommendation[]): string[] {
  return recs.map((rec) => {
    if (rec.kind === "imaging" && rec.target) return `Odeslán na ${rec.target}`;
    if (rec.kind === "referral" && rec.target) return `Doporučuji ${rec.target}`;
    if (rec.kind === "gp") return rec.text || "Kontrola u praktického lékaře";
    return rec.text;
  });
}
