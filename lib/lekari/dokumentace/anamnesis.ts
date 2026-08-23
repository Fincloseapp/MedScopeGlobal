/**
 * Professional adult anamnesis (MeDiktor) — structured intake + printable report.
 * Abbreviations: NO, OA, RA, FA, AA, TA, PA/SA, GA.
 * Does not invent clinical facts. Empty fields render as „neuvedeno“.
 */

export const ANAMNESIS_SCHEMA_VERSION = 1 as const;
export const ANAMNESIS_EMPTY = "neuvedeno";

export const ANAMNESIS_CONSENT_TEXT =
  "Souhlasím se zpracováním osobních a zdravotních údajů v aplikaci MeDiktor " +
  "(MedScopeGlobal, Al Synaptica Research Institute s.r.o.) za účelem přípravy " +
  "návrhu anamnestického zápisu v rámci vzdělávací a poradenské služby. " +
  "Beru na vědomí, že výstup není náhradou osobní lékařské péče, diagnostiky " +
  "ani zdravotnické dokumentace zdravotnického zařízení. Audio se po zpracování " +
  "neukládá. Za klinický obsah zápisu před jeho použitím odpovídá lékař.";

export type YesNoUnknown = "" | "ano" | "ne";
export type SexCode = "" | "zena" | "muz";

export type AnamnesisIdentification = {
  name: string;
  dateOfBirth: string;
  birthNumber: string;
  insurer: string;
  phone: string;
  email: string;
  sex: SexCode;
};

export type AnamnesisPresentIllness = {
  chiefComplaint: string;
  durationCourse: string;
  priorSpecialist: string;
  unmapped: string;
};

export type AnamnesisPersonal = {
  htnHeart: YesNoUnknown;
  diabetes: YesNoUnknown;
  thyroid: YesNoUnknown;
  asthmaCopd: YesNoUnknown;
  kidneyLiver: YesNoUnknown;
  psychNeuro: YesNoUnknown;
  oncology: YesNoUnknown;
  otherChronic: string;
  surgeriesTrauma: string;
  hospitalizations: string;
};

export type AnamnesisFamily = {
  miStrokeUnder50: YesNoUnknown;
  cancer: YesNoUnknown;
  dmHtn: YesNoUnknown;
  otherHereditary: string;
  mother: boolean;
  father: boolean;
  sibling: boolean;
  whoDetail: string;
};

export type AnamnesisPharmacologic = {
  prescription: string;
  otcSupplements: string;
  hakHrt: string;
};

export type AnamnesisAllergies = {
  drugsAbIodineAnesthetics: string;
  otherAllergies: string;
  dietIntolerances: string;
};

export type AnamnesisToxicology = {
  smoking: string;
  alcohol: string;
  caffeine: string;
};

export type AnamnesisSocial = {
  occupation: string;
  sedentary: boolean;
  physical: boolean;
  stress: boolean;
  shift: boolean;
  workTypeNote: string;
  livingSituation: string;
};

export type AnamnesisGynecologic = {
  applicable: boolean;
  births: string;
  miscarriages: string;
  lmpMenopause: string;
  pregnancy: string;
};

export type AnamnesisConsent = {
  acknowledged: boolean;
  text: string;
};

export type AnamnesisRecord = {
  schemaVersion: typeof ANAMNESIS_SCHEMA_VERSION;
  identification: AnamnesisIdentification;
  presentIllness: AnamnesisPresentIllness;
  personalHistory: AnamnesisPersonal;
  familyHistory: AnamnesisFamily;
  pharmacologic: AnamnesisPharmacologic;
  allergies: AnamnesisAllergies;
  toxicology: AnamnesisToxicology;
  socialOccupational: AnamnesisSocial;
  gynecologic: AnamnesisGynecologic;
  consent: AnamnesisConsent;
};

export const ANAMNESIS_DOCUMENT_TITLE = "Anamnestický dotazník pro dospělé pacienty";
export const ANAMNESIS_BRAND = "MeDiktor · MedScopeGlobal";
export const ANAMNESIS_KICKER =
  "Návrh zápisu ke kontrole lékařem. Výstup vzdělávací a poradenské služby — není náhradou osobní péče ani zdravotnickou dokumentací zařízení.";
export const ANAMNESIS_FOOTER =
  "MeDiktor · MedScopeGlobal — vzdělávací a poradenská služba. Tento dokument nenahrazuje osobní lékařskou péči.";

export const ANAMNESIS_SECTION_HEADINGS = [
  "Identifikační údaje",
  "Nynější potíže / Důvod návštěvy (NO — nynější onemocnění)",
  "Osobní anamnéza (OA)",
  "Rodinná anamnéza (RA)",
  "Farmakologická anamnéza (FA)",
  "Alergie a nesnášenlivosti (AA — alergologická anamnéza)",
  "Životní styl a návykové látky (TA — toxikologická anamnéza / abúzus)",
  "Pracovní a sociální anamnéza (PA / SA)",
  "Gynekologická anamnéza (GA)",
  "Prohlášení pacienta a souhlas se zpracováním údajů (GDPR)",
] as const;

export const ANAMNESIS_LABELS = {
  name: "Jméno a příjmení",
  dateOfBirth: "Datum narození",
  birthNumber: "Rodné číslo",
  insurer: "Pojišťovna",
  phone: "Telefon",
  email: "E-mail",
  sex: "Pohlaví",
  chiefComplaint: "Hlavní potíž",
  durationCourse: "Průběh a trvání",
  priorSpecialist: "Vyšetření u jiného specialisty",
  unmapped: "Další údaje (nezařazené)",
  otherChronic: "Jiné chronické choroby",
  surgeriesTrauma: "Operace a úrazy (s rokem)",
  hospitalizations: "Hospitalizace",
  miStroke: "IM / CMP před 50. rokem věku",
  cancer: "Zhoubné nádory",
  dmHtn: "Diabetes mellitus / hypertenze",
  otherHereditary: "Jiné dědičné nebo rodinné choroby",
  relative: "Příbuzný",
  mother: "matka",
  father: "otec",
  sibling: "sourozenec",
  prescription: "Léky na předpis (název a dávkování)",
  otc: "Volně prodejné přípravky a doplňky stravy (OTC)",
  hakHrt: "Hormonální antikoncepce / hormonální substituce (HAK / HRT)",
  drugAllergies: "Lékové alergie (antibiotika, jód, anestetika)",
  otherAllergies: "Jiné alergie",
  diet: "Dietní omezení / potravinové intolerance",
  smoking: "Kouření",
  alcohol: "Alkohol",
  caffeine: "Kofein",
  occupation: "Profese",
  workType: "Charakter práce",
  workSedentary: "sedavá",
  workPhysical: "fyzická",
  workStress: "stresová",
  workShift: "směnová",
  living: "Rodinné zázemí a bydlení",
  births: "Porody",
  miscarriages: "Potraty",
  lmp: "Poslední menstruace (LMP) / menopauza",
  pregnancy: "Těhotenství (gravidita)",
  consentRecorded: "Souhlas se zpracováním údajů",
  date: "Datum",
  signPatient: "Podpis pacienta / zákonného zástupce",
  signPhysician: "Podpis lékaře",
} as const;

export const ANAMNESIS_RECORDING_CHIPS = [
  { abbr: "ID", hint: "Identifikační údaje" },
  { abbr: "NO", hint: "Nynější onemocnění" },
  { abbr: "OA", hint: "Osobní anamnéza" },
  { abbr: "RA", hint: "Rodinná anamnéza" },
  { abbr: "FA", hint: "Farmakologická anamnéza" },
  { abbr: "AA", hint: "Alergologická anamnéza" },
  { abbr: "TA", hint: "Toxikologická / abúzus" },
  { abbr: "PA/SA", hint: "Pracovní a sociální anamnéza" },
  { abbr: "GA", hint: "Gynekologická anamnéza (ženy)" },
  { abbr: "GDPR", hint: "Prohlášení / souhlas" },
] as const;

export function numberedAnamnesisHeading(index: number): string {
  const heading = ANAMNESIS_SECTION_HEADINGS[index];
  return heading ? `${index + 1}. ${heading}` : "";
}

export const OA_CHRONIC_FIELDS: Array<{
  key: keyof Pick<
    AnamnesisPersonal,
    | "htnHeart"
    | "diabetes"
    | "thyroid"
    | "asthmaCopd"
    | "kidneyLiver"
    | "psychNeuro"
    | "oncology"
  >;
  label: string;
}> = [
  { key: "htnHeart", label: "Hypertenze / srdce" },
  { key: "diabetes", label: "Diabetes mellitus (DM)" },
  { key: "thyroid", label: "Štítná žláza" },
  { key: "asthmaCopd", label: "Astma / CHOPN" },
  { key: "kidneyLiver", label: "Ledviny / játra" },
  { key: "psychNeuro", label: "Psychiatrie / neurologie" },
  { key: "oncology", label: "Onkologie" },
];

const JSON_OPEN = "<<<MEDIKTOR_ANAMNESIS_JSON_V1";
const JSON_CLOSE = "MEDIKTOR_ANAMNESIS_JSON_V1>>>";

function blank(): string {
  return "";
}

export function emptyAnamnesisRecord(): AnamnesisRecord {
  return {
    schemaVersion: ANAMNESIS_SCHEMA_VERSION,
    identification: {
      name: blank(),
      dateOfBirth: blank(),
      birthNumber: blank(),
      insurer: blank(),
      phone: blank(),
      email: blank(),
      sex: "",
    },
    presentIllness: {
      chiefComplaint: blank(),
      durationCourse: blank(),
      priorSpecialist: blank(),
      unmapped: blank(),
    },
    personalHistory: {
      htnHeart: "",
      diabetes: "",
      thyroid: "",
      asthmaCopd: "",
      kidneyLiver: "",
      psychNeuro: "",
      oncology: "",
      otherChronic: blank(),
      surgeriesTrauma: blank(),
      hospitalizations: blank(),
    },
    familyHistory: {
      miStrokeUnder50: "",
      cancer: "",
      dmHtn: "",
      otherHereditary: blank(),
      mother: false,
      father: false,
      sibling: false,
      whoDetail: blank(),
    },
    pharmacologic: {
      prescription: blank(),
      otcSupplements: blank(),
      hakHrt: blank(),
    },
    allergies: {
      drugsAbIodineAnesthetics: blank(),
      otherAllergies: blank(),
      dietIntolerances: blank(),
    },
    toxicology: {
      smoking: blank(),
      alcohol: blank(),
      caffeine: blank(),
    },
    socialOccupational: {
      occupation: blank(),
      sedentary: false,
      physical: false,
      stress: false,
      shift: false,
      workTypeNote: blank(),
      livingSituation: blank(),
    },
    gynecologic: {
      applicable: false,
      births: blank(),
      miscarriages: blank(),
      lmpMenopause: blank(),
      pregnancy: blank(),
    },
    consent: {
      acknowledged: false,
      text: ANAMNESIS_CONSENT_TEXT,
    },
  };
}

function hasGynecologicContent(record: AnamnesisRecord): boolean {
  const g = record.gynecologic;
  return (
    g.applicable ||
    Boolean(g.births.trim()) ||
    Boolean(g.miscarriages.trim()) ||
    Boolean(g.lmpMenopause.trim()) ||
    Boolean(g.pregnancy.trim())
  );
}

/** Hide GA only when sex is explicitly male and no GA facts were recorded. */
export function showGynecologicSection(record: AnamnesisRecord): boolean {
  if (record.identification.sex === "muz") return hasGynecologicContent(record);
  return true;
}

function cell(value: string | undefined | null): string {
  const t = (value ?? "").replace(/\s+/g, " ").trim();
  if (!t || /^neuvedeno\.?$/i.test(t)) return ANAMNESIS_EMPTY;
  return t;
}

function yn(value: YesNoUnknown): string {
  if (value === "ano") return "ano";
  if (value === "ne") return "ne";
  return ANAMNESIS_EMPTY;
}

function boolList(
  items: Array<{ on: boolean; label: string }>,
  extra?: string
): string {
  const on = items.filter((i) => i.on).map((i) => i.label);
  const extraT = extra?.trim();
  if (on.length === 0 && !extraT) return ANAMNESIS_EMPTY;
  return [...on, extraT].filter(Boolean).join("; ");
}

export function attachAnamnesisJson(report: string, record: AnamnesisRecord): string {
  const body = stripAnamnesisMachineBlock(report).trimEnd();
  return `${body}\n\n${JSON_OPEN}\n${JSON.stringify(record)}\n${JSON_CLOSE}\n`;
}

export function stripAnamnesisMachineBlock(text: string): string {
  if (!text) return "";
  let out = text.replace(
    new RegExp(`${escapeReg(JSON_OPEN)}[\\s\\S]*?${escapeReg(JSON_CLOSE)}\\s*`, "g"),
    ""
  );
  // Truncated / missing close marker — never leak machine JSON to clinicians
  const openIdx = out.indexOf(JSON_OPEN);
  if (openIdx >= 0) out = out.slice(0, openIdx);
  return out
    .replace(/<!--\s*mediktor-anamnesis[\s\S]*?-->/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractEmbeddedAnamnesis(text: string): AnamnesisRecord | null {
  if (!text) return null;
  const m = text.match(
    new RegExp(`${escapeReg(JSON_OPEN)}\\s*([\\s\\S]*?)\\s*${escapeReg(JSON_CLOSE)}`)
  );
  if (!m?.[1]) return null;
  try {
    return coerceAnamnesisRecord(JSON.parse(m[1]));
  } catch {
    return null;
  }
}

export function looksLikeCanonicalAnamnesis(note: string): boolean {
  const t = stripAnamnesisMachineBlock(note);
  return (
    /\(NO\b/.test(t) &&
    /\(OA\)/.test(t) &&
    /\(RA\)/.test(t) &&
    /\(FA\)/.test(t) &&
    /\(AA\b/.test(t) &&
    /\(TA\b/.test(t) &&
    /\(PA\s*\/\s*SA\)/.test(t)
  );
}

export function looksLikeAnamnesisNote(note: string, templateId?: string | null): boolean {
  if (templateId === "anamneza") return true;
  if (extractEmbeddedAnamnesis(note)) return true;
  const t = stripAnamnesisMachineBlock(note);
  return (
    looksLikeCanonicalAnamnesis(t) ||
    /nynější (onemocnění|potíž)/i.test(t) ||
    /osobní anamnéza/i.test(t) ||
    /\bOA\b/.test(t) && /\bRA\b/.test(t) && /\bFA\b/.test(t)
  );
}

export type AnamnesisExportRow =
  | { kind: "text"; label: string; value: string }
  | { kind: "yn"; label: string; value: YesNoUnknown }
  | { kind: "ticks"; label: string; items: Array<{ on: boolean; label: string }>; extra?: string }
  | { kind: "para"; text: string }
  | { kind: "sign"; lines: string[] };

export type AnamnesisExportSection = {
  index: number;
  title: string;
  rows: AnamnesisExportRow[];
};

export type AnamnesisExportDocument = {
  title: string;
  brand: string;
  kicker: string;
  footer: string;
  sections: AnamnesisExportSection[];
};

function sexLabel(code: SexCode): string {
  if (code === "zena") return "žena";
  if (code === "muz") return "muž";
  return ANAMNESIS_EMPTY;
}

function consentStatus(acknowledged: boolean): string {
  return acknowledged ? "zaznamenán" : "nezaznamenán / neuvedeno";
}

export function buildAnamnesisExportDocument(
  record: AnamnesisRecord,
  opts?: { includeGa?: boolean; title?: string }
): AnamnesisExportDocument {
  const includeGa = opts?.includeGa ?? showGynecologicSection(record);
  const L = ANAMNESIS_LABELS;
  const id = record.identification;
  const no = record.presentIllness;
  const oa = record.personalHistory;
  const ra = record.familyHistory;
  const fa = record.pharmacologic;
  const aa = record.allergies;
  const ta = record.toxicology;
  const sa = record.socialOccupational;
  const ga = record.gynecologic;
  const consentText = record.consent.text.trim() || ANAMNESIS_CONSENT_TEXT;

  const sections: AnamnesisExportSection[] = [
    {
      index: 0,
      title: numberedAnamnesisHeading(0),
      rows: [
        { kind: "text", label: L.name, value: cell(id.name) },
        { kind: "text", label: L.dateOfBirth, value: cell(id.dateOfBirth) },
        { kind: "text", label: L.birthNumber, value: cell(id.birthNumber) },
        { kind: "text", label: L.insurer, value: cell(id.insurer) },
        { kind: "text", label: L.phone, value: cell(id.phone) },
        { kind: "text", label: L.email, value: cell(id.email) },
        { kind: "text", label: L.sex, value: sexLabel(id.sex) },
      ],
    },
    {
      index: 1,
      title: numberedAnamnesisHeading(1),
      rows: [
        { kind: "text", label: L.chiefComplaint, value: cell(no.chiefComplaint) },
        { kind: "text", label: L.durationCourse, value: cell(no.durationCourse) },
        { kind: "text", label: L.priorSpecialist, value: cell(no.priorSpecialist) },
        ...(no.unmapped.trim()
          ? [{ kind: "text" as const, label: L.unmapped, value: no.unmapped.trim() }]
          : []),
      ],
    },
    {
      index: 2,
      title: numberedAnamnesisHeading(2),
      rows: [
        ...OA_CHRONIC_FIELDS.map((f) => ({
          kind: "yn" as const,
          label: f.label,
          value: oa[f.key],
        })),
        { kind: "text", label: L.otherChronic, value: cell(oa.otherChronic) },
        { kind: "text", label: L.surgeriesTrauma, value: cell(oa.surgeriesTrauma) },
        { kind: "text", label: L.hospitalizations, value: cell(oa.hospitalizations) },
      ],
    },
    {
      index: 3,
      title: numberedAnamnesisHeading(3),
      rows: [
        { kind: "yn", label: L.miStroke, value: ra.miStrokeUnder50 },
        { kind: "yn", label: L.cancer, value: ra.cancer },
        { kind: "yn", label: L.dmHtn, value: ra.dmHtn },
        { kind: "text", label: L.otherHereditary, value: cell(ra.otherHereditary) },
        {
          kind: "ticks",
          label: L.relative,
          items: [
            { on: ra.mother, label: L.mother },
            { on: ra.father, label: L.father },
            { on: ra.sibling, label: L.sibling },
          ],
          extra: ra.whoDetail.trim() || undefined,
        },
      ],
    },
    {
      index: 4,
      title: numberedAnamnesisHeading(4),
      rows: [
        { kind: "text", label: L.prescription, value: cell(fa.prescription) },
        { kind: "text", label: L.otc, value: cell(fa.otcSupplements) },
        { kind: "text", label: L.hakHrt, value: cell(fa.hakHrt) },
      ],
    },
    {
      index: 5,
      title: numberedAnamnesisHeading(5),
      rows: [
        { kind: "text", label: L.drugAllergies, value: cell(aa.drugsAbIodineAnesthetics) },
        { kind: "text", label: L.otherAllergies, value: cell(aa.otherAllergies) },
        { kind: "text", label: L.diet, value: cell(aa.dietIntolerances) },
      ],
    },
    {
      index: 6,
      title: numberedAnamnesisHeading(6),
      rows: [
        { kind: "text", label: L.smoking, value: cell(ta.smoking) },
        { kind: "text", label: L.alcohol, value: cell(ta.alcohol) },
        { kind: "text", label: L.caffeine, value: cell(ta.caffeine) },
      ],
    },
    {
      index: 7,
      title: numberedAnamnesisHeading(7),
      rows: [
        { kind: "text", label: L.occupation, value: cell(sa.occupation) },
        {
          kind: "ticks",
          label: L.workType,
          items: [
            { on: sa.sedentary, label: L.workSedentary },
            { on: sa.physical, label: L.workPhysical },
            { on: sa.stress, label: L.workStress },
            { on: sa.shift, label: L.workShift },
          ],
          extra: sa.workTypeNote.trim() || undefined,
        },
        { kind: "text", label: L.living, value: cell(sa.livingSituation) },
      ],
    },
  ];

  if (includeGa) {
    sections.push({
      index: 8,
      title: numberedAnamnesisHeading(8),
      rows: [
        { kind: "text", label: L.births, value: cell(ga.births) },
        { kind: "text", label: L.miscarriages, value: cell(ga.miscarriages) },
        { kind: "text", label: L.lmp, value: cell(ga.lmpMenopause) },
        { kind: "text", label: L.pregnancy, value: cell(ga.pregnancy) },
      ],
    });
  }

  sections.push({
    index: 9,
    title: numberedAnamnesisHeading(9),
    rows: [
      { kind: "para", text: consentText },
      { kind: "text", label: L.consentRecorded, value: consentStatus(record.consent.acknowledged) },
      {
        kind: "sign",
        lines: [`${L.date}:`, `${L.signPatient}:`, `${L.signPhysician}:`],
      },
    ],
  });

  return {
    title: opts?.title?.trim() || ANAMNESIS_DOCUMENT_TITLE,
    brand: ANAMNESIS_BRAND,
    kicker: ANAMNESIS_KICKER,
    footer: ANAMNESIS_FOOTER,
    sections,
  };
}

function flattenExportRow(row: AnamnesisExportRow): string[] {
  if (row.kind === "text") return [`${row.label}: ${row.value}`];
  if (row.kind === "yn") return [`${row.label}: ${yn(row.value)}`];
  if (row.kind === "ticks") {
    return [`${row.label}: ${boolList(row.items, row.extra)}`];
  }
  if (row.kind === "para") return [row.text];
  return row.lines.map((line) => `${line} ........................................`);
}

export function renderAnamnesisReport(record: AnamnesisRecord, opts?: { includeGa?: boolean }): string {
  const doc = buildAnamnesisExportDocument(record, opts);
  const lines: string[] = [doc.title.toUpperCase(), `${doc.brand} — ${doc.kicker}`, ""];
  for (const section of doc.sections) {
    lines.push(section.title);
    for (const row of section.rows) lines.push(...flattenExportRow(row));
    lines.push("");
  }
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();
}

function escapePrint(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ynBoxes(value: YesNoUnknown): string {
  const mark = (on: boolean) => (on ? "☑" : "☐");
  return `${mark(value === "ano")} Ano &nbsp; ${mark(value === "ne")} Ne &nbsp; ${mark(value !== "ano" && value !== "ne")} Neuvedeno`;
}

function tick(on: boolean): string {
  return `${on ? "☑" : "☐"}`;
}

function printRow(label: string, value: string): string {
  return `<tr><th>${escapePrint(label)}</th><td>${escapePrint(value)}</td></tr>`;
}

function printExportRow(row: AnamnesisExportRow): string {
  if (row.kind === "text") return printRow(row.label, row.value);
  if (row.kind === "yn") {
    return `<tr><th>${escapePrint(row.label)}</th><td>${ynBoxes(row.value)}</td></tr>`;
  }
  if (row.kind === "ticks") {
    const boxes = row.items
      .map((item) => `${tick(item.on)} ${escapePrint(item.label)}`)
      .join(" &nbsp; ");
    const extra = row.extra ? ` — ${escapePrint(row.extra)}` : "";
    return `<tr><th>${escapePrint(row.label)}</th><td>${boxes}${extra}</td></tr>`;
  }
  if (row.kind === "para") {
    return `<tr class="para"><td colspan="2"><p>${escapePrint(row.text)}</p></td></tr>`;
  }
  return row.lines
    .map((line) => `<tr class="sign-row"><th>${escapePrint(line)}</th><td class="sign-line"></td></tr>`)
    .join("\n");
}

function printSection(section: AnamnesisExportSection): string {
  const rows = section.rows.map(printExportRow).join("\n");
  return `<section class="block"><h2>${escapePrint(section.title)}</h2>\n<table class="fields">${rows}</table></section>`;
}

/** Printable questionnaire HTML (numbered sections, Ano/Ne, GDPR, signature). */
export function renderAnamnesisPrintHtml(record: AnamnesisRecord): string {
  const doc = buildAnamnesisExportDocument(record);
  return [
    `<p class="kicker">${escapePrint(doc.brand)} — ${escapePrint(doc.kicker)}</p>`,
    ...doc.sections.map(printSection),
    `<p class="foot">${escapePrint(doc.footer)}</p>`,
  ].join("\n");
}

export const ANAMNESIS_PRINT_STYLES = `
  @page { size: A4; margin: 16mm 16mm 18mm 16mm; }
  body { font-family: "Times New Roman", Times, Georgia, serif; font-size: 11pt; line-height: 1.4; color: #1a2430; margin: 0; }
  .masthead { background: #021d33; color: #fff; padding: 10pt 12pt; margin: 0 0 10pt 0; }
  .masthead .brand { font-size: 9pt; letter-spacing: 0.04em; opacity: 0.85; margin: 0 0 2pt 0; }
  h1 { font-size: 15pt; font-weight: bold; margin: 0; color: #fff; }
  h2 { font-size: 11.5pt; font-weight: bold; margin: 0; color: #021d33; }
  p { margin: 0 0 8pt 0; }
  .kicker { font-size: 9pt; color: #4a5560; margin: 0 0 12pt 0; }
  .block { break-inside: avoid; page-break-inside: avoid; margin: 0 0 10pt 0; border: 1px solid #d5e3ee; }
  .block h2 { background: #e8f1f8; padding: 5pt 8pt; border-bottom: 1px solid #c5d6e4; }
  table.fields { width: 100%; border-collapse: collapse; }
  table.fields th { text-align: left; vertical-align: top; width: 38%; padding: 4pt 8pt; font-weight: 600; color: #2a3a48; background: #f7fafc; border-bottom: 1px solid #e6eef4; }
  table.fields td { vertical-align: top; padding: 4pt 8pt; border-bottom: 1px solid #e6eef4; }
  table.fields tr:last-child th, table.fields tr:last-child td { border-bottom: 0; }
  table.fields tr.para td { background: #fff; font-size: 10pt; }
  table.fields td.sign-line { border-bottom: 1px solid #021d33; height: 18pt; }
  .foot { font-size: 8.5pt; color: #5a6570; margin: 14pt 0 0 0; border-top: 1px solid #c5d6e4; padding-top: 6pt; }
  .no-print { margin: 0 0 12pt 0; padding: 6pt 12pt; font-size: 11pt; }
  @media print { .no-print { display: none !important; } .block { break-inside: avoid; } }
`;

export function buildAnamnesisPrintDocument(
  record: AnamnesisRecord,
  title = ANAMNESIS_DOCUMENT_TITLE
): string {
  const doc = buildAnamnesisExportDocument(record, { title });
  const safeTitle = escapePrint(doc.title);
  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>${safeTitle}</title>
<style>${ANAMNESIS_PRINT_STYLES}</style>
</head>
<body>
<button class="no-print" type="button" onclick="window.print()">Tisknout</button>
<header class="masthead">
<p class="brand">${escapePrint(doc.brand)}</p>
<h1>${safeTitle}</h1>
</header>
${renderAnamnesisPrintHtml(record)}
</body>
</html>`;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function asYn(v: unknown): YesNoUnknown {
  const s = asString(v).trim().toLowerCase();
  if (s === "ano" || s === "yes" || s === "true") return "ano";
  if (s === "ne" || s === "no" || s === "false") return "ne";
  return "";
}

function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = asString(v).trim().toLowerCase();
  return s === "true" || s === "ano" || s === "1";
}

function asSex(v: unknown): SexCode {
  const s = asString(v).trim().toLowerCase();
  if (s === "zena" || s === "žena" || s === "f" || s === "female") return "zena";
  if (s === "muz" || s === "muž" || s === "m" || s === "male") return "muz";
  return "";
}

export function coerceAnamnesisRecord(raw: unknown): AnamnesisRecord {
  const base = emptyAnamnesisRecord();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const id = (o.identification ?? {}) as Record<string, unknown>;
  const no = (o.presentIllness ?? o.no ?? {}) as Record<string, unknown>;
  const oa = (o.personalHistory ?? o.oa ?? {}) as Record<string, unknown>;
  const ra = (o.familyHistory ?? o.ra ?? {}) as Record<string, unknown>;
  const fa = (o.pharmacologic ?? o.fa ?? {}) as Record<string, unknown>;
  const aa = (o.allergies ?? o.aa ?? {}) as Record<string, unknown>;
  const ta = (o.toxicology ?? o.lifestyle ?? o.ta ?? {}) as Record<string, unknown>;
  const sa = (o.socialOccupational ?? o.sa ?? o.pa ?? {}) as Record<string, unknown>;
  const ga = (o.gynecologic ?? o.ga ?? {}) as Record<string, unknown>;
  const co = (o.consent ?? {}) as Record<string, unknown>;

  base.identification = {
    name: asString(id.name),
    dateOfBirth: asString(id.dateOfBirth ?? id.dob),
    birthNumber: asString(id.birthNumber ?? id.personalId),
    insurer: asString(id.insurer ?? id.insurance),
    phone: asString(id.phone),
    email: asString(id.email),
    sex: asSex(id.sex),
  };
  base.presentIllness = {
    chiefComplaint: asString(no.chiefComplaint ?? no.main),
    durationCourse: asString(no.durationCourse ?? no.duration),
    priorSpecialist: asString(no.priorSpecialist ?? no.otherSpecialist),
    unmapped: asString(no.unmapped),
  };
  base.personalHistory = {
    htnHeart: asYn(oa.htnHeart),
    diabetes: asYn(oa.diabetes),
    thyroid: asYn(oa.thyroid),
    asthmaCopd: asYn(oa.asthmaCopd),
    kidneyLiver: asYn(oa.kidneyLiver),
    psychNeuro: asYn(oa.psychNeuro ?? oa.psychNeurol),
    oncology: asYn(oa.oncology),
    otherChronic: asString(oa.otherChronic ?? oa.other),
    surgeriesTrauma: asString(oa.surgeriesTrauma ?? oa.surgeriesInjuries),
    hospitalizations: asString(oa.hospitalizations),
  };
  base.familyHistory = {
    miStrokeUnder50: asYn(ra.miStrokeUnder50),
    cancer: asYn(ra.cancer),
    dmHtn: asYn(ra.dmHtn),
    otherHereditary: asString(ra.otherHereditary ?? ra.other),
    mother: asBool(ra.mother),
    father: asBool(ra.father),
    sibling: asBool(ra.sibling),
    whoDetail: asString(ra.whoDetail ?? ra.whoInFamily),
  };
  base.pharmacologic = {
    prescription: asString(fa.prescription),
    otcSupplements: asString(fa.otcSupplements),
    hakHrt: asString(fa.hakHrt),
  };
  base.allergies = {
    drugsAbIodineAnesthetics: asString(
      aa.drugsAbIodineAnesthetics ?? aa.drugs
    ),
    otherAllergies: asString(aa.otherAllergies ?? aa.other),
    dietIntolerances: asString(aa.dietIntolerances ?? aa.dietIntolerance),
  };
  base.toxicology = {
    smoking: asString(ta.smoking),
    alcohol: asString(ta.alcohol),
    caffeine: asString(ta.caffeine),
  };
  base.socialOccupational = {
    occupation: asString(sa.occupation),
    sedentary: asBool(sa.sedentary),
    physical: asBool(sa.physical),
    stress: asBool(sa.stress),
    shift: asBool(sa.shift),
    workTypeNote: asString(sa.workTypeNote ?? sa.workCharacter),
    livingSituation: asString(sa.livingSituation ?? sa.familyBackground),
  };
  const gaText =
    asString(ga.births) ||
    asString(ga.miscarriages) ||
    asString(ga.lmpMenopause) ||
    asString(ga.pregnancy);
  base.gynecologic = {
    applicable: asBool(ga.applicable) || Boolean(gaText) || base.identification.sex === "zena",
    births: asString(ga.births),
    miscarriages: asString(ga.miscarriages),
    lmpMenopause: asString(ga.lmpMenopause),
    pregnancy: asString(ga.pregnancy),
  };
  base.consent = {
    acknowledged: asBool(co.acknowledged),
    text: asString(co.text).trim() || ANAMNESIS_CONSENT_TEXT,
  };
  return base;
}

function isEmptyValue(v: unknown): boolean {
  if (typeof v === "boolean") return v === false;
  if (typeof v === "string") {
    const t = v.trim();
    return !t || /^neuvedeno\.?$/i.test(t);
  }
  return v == null;
}

/** Fill empty fields from overlay; never overwrite existing facts. */
export function mergeAnamnesis(
  base: AnamnesisRecord,
  overlay: AnamnesisRecord
): AnamnesisRecord {
  const out = structuredClone(base) as AnamnesisRecord;
  const walk = (target: Record<string, unknown>, src: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(src)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const cur = target[k];
        if (cur && typeof cur === "object" && !Array.isArray(cur)) {
          walk(cur as Record<string, unknown>, v as Record<string, unknown>);
        }
        continue;
      }
      if (typeof v === "boolean") {
        if (v === true) target[k] = true;
        continue;
      }
      if (!isEmptyValue(v) && isEmptyValue(target[k])) {
        target[k] = v;
      }
    }
  };
  walk(out as unknown as Record<string, unknown>, overlay as unknown as Record<string, unknown>);
  if (!out.consent.text.trim()) out.consent.text = ANAMNESIS_CONSENT_TEXT;
  return out;
}

type SectionKey =
  | "id"
  | "no"
  | "oa"
  | "ra"
  | "fa"
  | "aa"
  | "ta"
  | "sa"
  | "ga"
  | "consent"
  | "other";

const HEADING_RULES: Array<{ key: SectionKey; re: RegExp }> = [
  { key: "id", re: /identifika/i },
  {
    key: "no",
    re: /nynějš|důvod n[aá]vštěv|\bNO\b|chief complaint|hlavn[ií] probl/i,
  },
  { key: "oa", re: /osobn[ií] anamn|\bOA\b/i },
  { key: "ra", re: /rodinn[aá] anamn|\bRA\b/i },
  { key: "fa", re: /farmakolog|medikac|\bFA\b|l[eé]ky na p[rř]edpis/i },
  { key: "aa", re: /alerg|\bAA\b|nesn[aá]šen/i },
  {
    key: "ta",
    re: /životn[ií] styl|n[aá]vykov|\bTA\b|ab[uú]zus|toxikolog|kouřen|alkohol|kofein/i,
  },
  {
    key: "sa",
    re: /pracovn[ií]|soci[aá]ln|\bPA\b|\bSA\b|profes/i,
  },
  { key: "ga", re: /gynekolog|\bGA\b|porody|menopauz|gravidit/i },
  { key: "consent", re: /prohl[aá]šen|souhlas|gdpr/i },
];

function classifyHeading(line: string): SectionKey | null {
  const t = line.replace(/^#+\s*/, "").trim();
  if (!t || t.length > 90) return null;
  if (/[.!?]$/.test(t) && t.length > 40) return null;
  // Field rows ("Kouření: nekuřák") are not section headings.
  if (/:\s+\S+/.test(t) && !/^\d+\.\s/.test(t)) return null;
  if (t.startsWith("ANAMNESTICKÝ")) return null;
  for (const rule of HEADING_RULES) {
    if (rule.re.test(t)) return rule.key;
  }
  return null;
}

function splitByHeadings(text: string): Partial<Record<SectionKey, string>> {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const buckets: Partial<Record<SectionKey, string[]>> = {};
  let current: SectionKey = "other";
  for (const raw of lines) {
    const key = classifyHeading(raw);
    if (key) {
      current = key;
      continue;
    }
    if (!buckets[current]) buckets[current] = [];
    buckets[current]!.push(raw);
  }
  const out: Partial<Record<SectionKey, string>> = {};
  for (const [k, arr] of Object.entries(buckets)) {
    const joined = (arr ?? []).join("\n").trim();
    if (joined) out[k as SectionKey] = joined;
  }
  return out;
}

function takeLabeled(block: string, labels: string[]): string {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  const found: string[] = [];
  for (const label of labels) {
    const re = new RegExp(`^${escapeReg(label)}\\s*[:–-]\\s*(.*)$`, "i");
    for (const line of lines) {
      const m = line.match(re);
      if (m) {
        const v = m[1].trim();
        if (v && !/^neuvedeno\.?$/i.test(v)) found.push(v);
      }
    }
  }
  return found.join("; ");
}

function leftoverAfterLabels(block: string, labels: string[]): string {
  const re = new RegExp(
    `^(${labels.map(escapeReg).join("|")})\\s*[:–-]`,
    "i"
  );
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !re.test(l) && !/^neuvedeno\.?$/i.test(l))
    .join("\n")
    .trim();
}

function ynFromText(block: string, needles: RegExp): YesNoUnknown {
  if (!needles.test(block)) return "";
  const sentences = block.split(/[.;\n]/);
  for (const s of sentences) {
    if (!needles.test(s)) continue;
    if (/\bneud[aá]v|\bneguj|neprokáz|negativn[ií]|alergie ne/i.test(s)) return "ne";
    return "ano";
  }
  return "ano";
}

function applySectionBlock(record: AnamnesisRecord, key: SectionKey, block: string) {
  const b = block.trim();
  if (!b) return;
  switch (key) {
    case "id": {
      record.identification.name ||= takeLabeled(b, ["Jméno a příjmení", "Jméno", "Pacient"]);
      record.identification.dateOfBirth ||= takeLabeled(b, ["Datum narození", "Narozen", "Narozena"]);
      record.identification.birthNumber ||= takeLabeled(b, ["Rodné číslo", "RČ", "RC"]);
      record.identification.insurer ||= takeLabeled(b, ["Pojišťovna", "ZP"]);
      record.identification.phone ||= takeLabeled(b, ["Telefon", "Tel"]);
      record.identification.email ||= takeLabeled(b, ["E-mail", "Email"]);
      const leftover = leftoverAfterLabels(b, [
        "Jméno a příjmení",
        "Jméno",
        "Pacient",
        "Datum narození",
        "Narozen",
        "Narozena",
        "Rodné číslo",
        "RČ",
        "RC",
        "Pojišťovna",
        "ZP",
        "Telefon",
        "Tel",
        "E-mail",
        "Email",
        "Pohlaví",
      ]);
      if (leftover && !record.identification.name) record.identification.name = leftover.split("\n")[0];
      if (/žena|zena/i.test(b)) record.identification.sex ||= "zena";
      if (/\bmuž\b|\bmuz\b/i.test(b)) record.identification.sex ||= "muz";
      break;
    }
    case "no": {
      record.presentIllness.chiefComplaint ||= takeLabeled(b, [
        "Hlavní problém",
        "Hlavní potíž",
        "Důvod návštěvy",
      ]);
      record.presentIllness.durationCourse ||= takeLabeled(b, ["Trvání a vývoj", "Trvání", "Vývoj"]);
      record.presentIllness.priorSpecialist ||= takeLabeled(b, [
        "Vyšetření u jiného specialisty",
        "Specialista",
      ]);
      const leftover = leftoverAfterLabels(b, [
        "Hlavní problém",
        "Hlavní potíž",
        "Důvod návštěvy",
        "Trvání a vývoj",
        "Trvání",
        "Vývoj",
        "Vyšetření u jiného specialisty",
        "Specialista",
        "Další údaje (nezařazené)",
      ]);
      if (leftover) {
        if (!record.presentIllness.chiefComplaint) record.presentIllness.chiefComplaint = leftover;
        else record.presentIllness.unmapped = [record.presentIllness.unmapped, leftover]
          .filter(Boolean)
          .join("\n");
      }
      break;
    }
    case "oa": {
      const p = record.personalHistory;
      if (!p.htnHeart) p.htnHeart = ynFromText(b, /hypertenz|srdc|HTN|\bHT\b|ICH|fibril/i);
      if (!p.diabetes) p.diabetes = ynFromText(b, /diabet|\bDM\b|cukrovk/i);
      if (!p.thyroid) p.thyroid = ynFromText(b, /štítn|thyre|tyreo/i);
      if (!p.asthmaCopd) p.asthmaCopd = ynFromText(b, /astma|CHOPN|chronick[aá] obstruk/i);
      if (!p.kidneyLiver) p.kidneyLiver = ynFromText(b, /ledvin|j[aá]tr|ren[aá]ln|hepat/i);
      if (!p.psychNeuro) p.psychNeuro = ynFromText(b, /psych|neurol|deprese|epilep/i);
      if (!p.oncology) p.oncology = ynFromText(b, /onko|karcinom|n[aá]dor|rakovin/i);
      p.surgeriesTrauma ||= takeLabeled(b, ["Operace a úrazy (s rokem)", "Operace a úrazy", "Operace", "Úrazy"]);
      p.hospitalizations ||= takeLabeled(b, ["Hospitalizace"]);
      p.otherChronic ||= takeLabeled(b, ["Jiné chronické choroby", "Jiné", "Chronické choroby"]);
      const leftover = leftoverAfterLabels(b, [
        "Chronické choroby",
        "Jiné chronické choroby",
        "Operace a úrazy (s rokem)",
        "Operace a úrazy",
        "Operace",
        "Úrazy",
        "Hospitalizace",
        "Jiné",
      ]);
      if (leftover && !p.otherChronic) p.otherChronic = leftover;
      else if (leftover) p.otherChronic = [p.otherChronic, leftover].filter(Boolean).join("\n");
      break;
    }
    case "ra": {
      const r = record.familyHistory;
      if (!r.miStrokeUnder50) r.miStrokeUnder50 = ynFromText(b, /\bIM\b|infarkt|CMP|iktus|mrtvic/i);
      if (!r.cancer) r.cancer = ynFromText(b, /rakovin|karcinom|n[aá]dor|onko/i);
      if (!r.dmHtn) r.dmHtn = ynFromText(b, /diabet|hypertenz|\bDM\b|\bHT\b/i);
      if (/matka/i.test(b)) r.mother = true;
      if (/otec/i.test(b)) r.father = true;
      if (/sourozen/i.test(b)) r.sibling = true;
      r.whoDetail ||= takeLabeled(b, ["Kdo v rodině", "Kdo"]);
      r.otherHereditary ||= takeLabeled(b, ["Jiné dědičné / rodinné", "Jiné"]);
      const leftover = leftoverAfterLabels(b, [
        "IM / CMP do 50 let",
        "Zhoubné nádory",
        "DM / hypertenze",
        "Jiné dědičné / rodinné",
        "Kdo v rodině",
        "Jiné",
        "Kdo",
      ]);
      if (leftover && !r.otherHereditary) r.otherHereditary = leftover;
      break;
    }
    case "fa": {
      record.pharmacologic.prescription ||= takeLabeled(b, [
        "Léky na předpis (název + dávkování)",
        "Léky na předpis",
        "Medikace",
      ]);
      record.pharmacologic.otcSupplements ||= takeLabeled(b, [
        "Volně prodejné léky a doplňky (OTC)",
        "OTC",
        "Doplňky",
      ]);
      record.pharmacologic.hakHrt ||= takeLabeled(b, [
        "Hormonální antikoncepce / HRT (HAK/HRT)",
        "HAK/HRT",
        "HAK",
        "HRT",
      ]);
      const leftover = leftoverAfterLabels(b, [
        "Léky na předpis (název + dávkování)",
        "Léky na předpis",
        "Medikace",
        "Volně prodejné léky a doplňky (OTC)",
        "OTC",
        "Doplňky",
        "Hormonální antikoncepce / HRT (HAK/HRT)",
        "HAK/HRT",
        "HAK",
        "HRT",
      ]);
      if (leftover && !record.pharmacologic.prescription) {
        record.pharmacologic.prescription = leftover;
      } else if (leftover) {
        record.pharmacologic.prescription = [record.pharmacologic.prescription, leftover]
          .filter(Boolean)
          .join("\n");
      }
      break;
    }
    case "aa": {
      record.allergies.drugsAbIodineAnesthetics ||= takeLabeled(b, [
        "Lékové alergie (ATB, jod, anestetika)",
        "Lékové alergie",
        "Alergie na léky",
      ]);
      record.allergies.otherAllergies ||= takeLabeled(b, ["Jiné alergie"]);
      record.allergies.dietIntolerances ||= takeLabeled(b, [
        "Dieta / potravinové intolerance",
        "Intolerance",
        "Dieta",
      ]);
      const leftover = leftoverAfterLabels(b, [
        "Lékové alergie (ATB, jod, anestetika)",
        "Lékové alergie",
        "Alergie na léky",
        "Jiné alergie",
        "Dieta / potravinové intolerance",
        "Intolerance",
        "Dieta",
      ]);
      if (leftover) {
        if (/atb|antibiot|penicilin|jod|anestet|ibuprofen|nsaid/i.test(leftover)) {
          record.allergies.drugsAbIodineAnesthetics ||= leftover;
        } else if (/mléko|lakt[oó]z|lepek|potravin|intoler/i.test(leftover)) {
          record.allergies.dietIntolerances ||= leftover;
        } else {
          record.allergies.otherAllergies ||= leftover;
        }
      }
      break;
    }
    case "ta": {
      record.toxicology.smoking ||= takeLabeled(b, ["Kouření"]);
      record.toxicology.alcohol ||= takeLabeled(b, ["Alkohol"]);
      record.toxicology.caffeine ||= takeLabeled(b, ["Kofein"]);
      const leftover = leftoverAfterLabels(b, ["Kouření", "Alkohol", "Kofein"]);
      if (leftover) {
        if (!record.toxicology.smoking && /kouř|cigaret|nekuř/i.test(leftover)) {
          record.toxicology.smoking = leftover;
        } else if (!record.toxicology.alcohol && /alkohol|pivo|víno/i.test(leftover)) {
          record.toxicology.alcohol = leftover;
        } else if (!record.toxicology.caffeine && /kofein|káv/i.test(leftover)) {
          record.toxicology.caffeine = leftover;
        } else if (!record.toxicology.smoking) {
          record.toxicology.smoking = leftover;
        }
      }
      break;
    }
    case "sa": {
      record.socialOccupational.occupation ||= takeLabeled(b, ["Profese", "Zaměstnání"]);
      record.socialOccupational.livingSituation ||= takeLabeled(b, [
        "Rodinné zázemí / bydlení",
        "Rodinné zázemí",
        "Bydlení",
      ]);
      if (/sedav/i.test(b)) record.socialOccupational.sedentary = true;
      if (/fyzick/i.test(b)) record.socialOccupational.physical = true;
      if (/stres/i.test(b)) record.socialOccupational.stress = true;
      if (/směnov|smenov|směny|smeny|nočn/i.test(b)) record.socialOccupational.shift = true;
      const leftover = leftoverAfterLabels(b, [
        "Profese",
        "Zaměstnání",
        "Charakter práce",
        "Rodinné zázemí / bydlení",
        "Rodinné zázemí",
        "Bydlení",
      ]);
      if (leftover && !record.socialOccupational.occupation) {
        record.socialOccupational.occupation = leftover;
      } else if (leftover && !record.socialOccupational.livingSituation) {
        record.socialOccupational.livingSituation = leftover;
      }
      break;
    }
    case "ga": {
      record.gynecologic.applicable = true;
      record.identification.sex ||= "zena";
      record.gynecologic.births ||= takeLabeled(b, ["Porody"]);
      record.gynecologic.miscarriages ||= takeLabeled(b, ["Potraty"]);
      record.gynecologic.lmpMenopause ||= takeLabeled(b, [
        "Poslední menstruace (LMP) / menopauza",
        "LMP",
        "Menopauza",
      ]);
      record.gynecologic.pregnancy ||= takeLabeled(b, ["Gravidita", "Těhotenství"]);
      const leftover = leftoverAfterLabels(b, [
        "Porody",
        "Potraty",
        "Poslední menstruace (LMP) / menopauza",
        "LMP",
        "Menopauza",
        "Gravidita",
        "Těhotenství",
      ]);
      if (leftover && !record.gynecologic.lmpMenopause) record.gynecologic.lmpMenopause = leftover;
      break;
    }
    case "consent": {
      if (/souhlas/i.test(b) && /ano|zaznamen/i.test(b)) record.consent.acknowledged = true;
      break;
    }
    default: {
      if (b && !record.presentIllness.unmapped) record.presentIllness.unmapped = b;
      else if (b) {
        record.presentIllness.unmapped = [record.presentIllness.unmapped, b]
          .filter(Boolean)
          .join("\n");
      }
    }
  }
}

/** Best-effort parse of an existing note. Does not invent facts. */
export function parseAnamnesisFromNote(note: string): AnamnesisRecord {
  const embedded = extractEmbeddedAnamnesis(note);
  const text = stripAnamnesisMachineBlock(note);
  const parsed = emptyAnamnesisRecord();
  if (!text.trim()) return embedded ?? parsed;
  const buckets = splitByHeadings(text);
  for (const [key, block] of Object.entries(buckets)) {
    applySectionBlock(parsed, key as SectionKey, block ?? "");
  }
  if (embedded) return mergeAnamnesis(embedded, parsed);
  return parsed;
}

/**
 * Keyword / heading extraction from STT or free dictation.
 * Copies phrases from the source; does not diagnose.
 */
export function extractAnamnesisFromTranscript(transcript: string): AnamnesisRecord {
  const record = parseAnamnesisFromNote(transcript);
  const t = transcript.replace(/\r\n/g, "\n").trim();
  if (!t) return record;

  const pushIfEmpty = (cur: string, next: string) => (cur.trim() ? cur : next.trim());

  const sentences = t
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const s of sentences) {
    const low = s.toLowerCase();
    if (
      /alerg/i.test(s) ||
      /\bAA\b/.test(s) ||
      /penicilin|atb|antibiot|jodov|anestet/i.test(s)
    ) {
      if (/lék|atb|antibiot|jod|anestet|penicilin/i.test(low)) {
        record.allergies.drugsAbIodineAnesthetics = pushIfEmpty(
          record.allergies.drugsAbIodineAnesthetics,
          s
        );
      } else if (/mléko|lakt[oó]z|lepek|potravin|intoler/i.test(low)) {
        record.allergies.dietIntolerances = pushIfEmpty(record.allergies.dietIntolerances, s);
      } else {
        record.allergies.otherAllergies = pushIfEmpty(record.allergies.otherAllergies, s);
      }
      continue;
    }
    if (/nekuř|kouř|cigaret|packyear/i.test(s)) {
      record.toxicology.smoking = pushIfEmpty(record.toxicology.smoking, s);
      continue;
    }
    if (/alkohol|pivo|víno|abstinen/i.test(s)) {
      record.toxicology.alcohol = pushIfEmpty(record.toxicology.alcohol, s);
      continue;
    }
    if (/kofein|kávu|kafe|espresso/i.test(s)) {
      record.toxicology.caffeine = pushIfEmpty(record.toxicology.caffeine, s);
      continue;
    }
    if (/beru |užívá |medikac|tbl\.|mg\b|1-0-0|HAK|HRT/i.test(s)) {
      if (/antikoncepc|HRT|estrogen/i.test(s)) {
        record.pharmacologic.hakHrt = pushIfEmpty(record.pharmacologic.hakHrt, s);
      } else if (/doplněk|vitamin|volně prodej/i.test(low)) {
        record.pharmacologic.otcSupplements = pushIfEmpty(
          record.pharmacologic.otcSupplements,
          s
        );
      } else {
        record.pharmacologic.prescription = pushIfEmpty(record.pharmacologic.prescription, s);
      }
      continue;
    }
    if (/operac|úraz|uraz|hospitaliz|ektomii|ektomie|fraktur/i.test(s)) {
      if (/hospitaliz/i.test(s)) {
        record.personalHistory.hospitalizations = pushIfEmpty(
          record.personalHistory.hospitalizations,
          s
        );
      } else {
        record.personalHistory.surgeriesTrauma = pushIfEmpty(
          record.personalHistory.surgeriesTrauma,
          s
        );
      }
      continue;
    }
    if (/matka|otec|sourozen|rodin/i.test(s) && /IM|infarkt|CMP|rakovin|diabet|tlak/i.test(s)) {
      applySectionBlock(record, "ra", s);
      continue;
    }
    if (/porod|potrat|menstru|menopauz|gravid|těhoten/i.test(s)) {
      applySectionBlock(record, "ga", s);
      continue;
    }
    if (/pracuj|profese|zaměstn|sedav|směnov|směny/i.test(s)) {
      applySectionBlock(record, "sa", s);
      continue;
    }
  }

  const hasAny =
    record.presentIllness.chiefComplaint ||
    record.presentIllness.unmapped ||
    record.personalHistory.otherChronic ||
    record.pharmacologic.prescription;
  if (!hasAny) {
    record.presentIllness.unmapped = t;
  } else if (
    !record.presentIllness.chiefComplaint &&
    !looksLikeCanonicalAnamnesis(t) &&
    t.length < 800
  ) {
    record.presentIllness.chiefComplaint = t;
  }

  return record;
}

export function migrateAnamnesisNote(note: string, transcript?: string | null): AnamnesisRecord {
  const fromNote = parseAnamnesisFromNote(note);
  const visible = stripAnamnesisMachineBlock(note).trim();
  const fromVisible = visible ? extractAnamnesisFromTranscript(visible) : emptyAnamnesisRecord();
  const fromTranscript = transcript?.trim()
    ? extractAnamnesisFromTranscript(transcript)
    : emptyAnamnesisRecord();
  const merged = mergeAnamnesis(mergeAnamnesis(fromNote, fromVisible), fromTranscript);
  const mappedSomething =
    Boolean(merged.presentIllness.chiefComplaint.trim()) ||
    Boolean(merged.presentIllness.unmapped.trim()) ||
    Boolean(merged.personalHistory.otherChronic.trim()) ||
    Boolean(merged.pharmacologic.prescription.trim()) ||
    Boolean(merged.allergies.otherAllergies.trim()) ||
    Boolean(merged.allergies.drugsAbIodineAnesthetics.trim()) ||
    looksLikeCanonicalAnamnesis(visible);

  if (!mappedSomething && visible) {
    merged.presentIllness.unmapped = visible;
  }
  if (!merged.consent.text.trim()) merged.consent.text = ANAMNESIS_CONSENT_TEXT;
  return merged;
}

export function buildAnamnesisStoredNote(record: AnamnesisRecord): string {
  return attachAnamnesisJson(renderAnamnesisReport(record), record);
}

export function anamnesisTitle(record: AnamnesisRecord): string {
  const name = record.identification.name.trim();
  const chiefRaw = record.presentIllness.chiefComplaint.replace(/\s+/g, " ").trim();
  const chief = !chiefRaw || chiefRaw.startsWith("{") || chiefRaw.startsWith("[") ? "" : chiefRaw;
  if (name && chief) return `Anamnéza · ${name} · ${chief}`.slice(0, 120);
  if (name) return `Anamnéza · ${name}`.slice(0, 120);
  if (chief) return `Anamnéza (NO) · ${chief}`.slice(0, 120);
  return "Anamnéza (NO, OA, RA, FA, AA, TA, PA/SA)";
}
