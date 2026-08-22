/** Light medication parse from extract / doporučený_postup. Not a required JSON key. */

export type PatientMedication = {
  name: string;
  dosage: string;
};

const STOP = new Set(
  [
    "kontrola",
    "doporučení",
    "doporuceni",
    "diagnóza",
    "diagnózu",
    "dg",
    "pacient",
    "lékař",
    "lekar",
    "zpráva",
    "zprava",
    "tablety",
    "tableta",
    "užívejte",
    "uzivejte",
    "předepsané",
    "predepsane",
    "medikace",
    "léky",
    "leky",
    "za",
    "měsíce",
    "mesice",
    "susp",
    "anamnéza",
    "vyšetření",
    "nalez",
    "nález",
    "postup",
    "pokyny",
    "pokyn",
    "denně",
    "denne",
    "ráno",
    "vecer",
    "večer",
  ].map((s) => s.toLowerCase()),
);

const LABEL_RE =
  /(?:medikace|léky|leky|farmakoterapie|farmakologická anamnéza|rp\.?|předepsan[áéý]\s+léky)[:\s]+(.+)/i;

const DRUG_DOSE_RE =
  /\b([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][A-Za-záčďéěíňóřšťúůýž]{2,}(?:[-\s][A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽa-záčďéěíňóřšťúůýž]{2,})?)\s+(\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|ug|g|ml|mj|iu|tbl|cps))\b(?:\s*(\d[-–]\d[-–]\d))?/g;

function cleanName(raw: string): string {
  return raw.replace(/^[-–•*\d.)\s]+/, "").replace(/[.,;:]+$/g, "").trim();
}

function isStop(name: string): boolean {
  const key = name.toLowerCase();
  if (key.length < 3) return true;
  if (STOP.has(key)) return true;
  if (/^(dg|susp|kontrola)\b/i.test(key)) return true;
  return false;
}

function addMed(
  out: PatientMedication[],
  seen: Set<string>,
  name: string,
  dosage: string,
) {
  const n = cleanName(name);
  if (isStop(n)) return;
  const key = n.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  out.push({
    name: n.slice(0, 80),
    dosage: dosage.replace(/\s+/g, " ").trim().slice(0, 80),
  });
}

function parseDrugList(list: string, out: PatientMedication[], seen: Set<string>) {
  const parts = list.split(/[,;•]|\s+a\s+/i);
  for (const part of parts) {
    const m = part
      .trim()
      .match(/^([A-Za-záčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][A-Za-záčďéěíňóřšťúůýž-]{2,})\s*(.*)$/);
    if (m) addMed(out, seen, m[1], m[2] || "");
  }
}

export function asMedicationList(value: unknown): PatientMedication[] {
  if (!Array.isArray(value)) return [];
  const out: PatientMedication[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item === "string") {
      parseDrugList(item, out, seen);
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = String(rec.name || rec.nazev || rec.lek || "").trim();
    const dosage = String(rec.dosage || rec.davka || rec.dávka || rec.sila || rec.síla || "").trim();
    if (name) addMed(out, seen, name, dosage);
  }
  return out;
}

export function parseMedicationsFromText(text: string): PatientMedication[] {
  const out: PatientMedication[] = [];
  const seen = new Set<string>();
  const blob = (text || "").replace(/\r/g, "");
  for (const line of blob.split("\n")) {
    const labeled = line.match(LABEL_RE);
    if (labeled?.[1]) parseDrugList(labeled[1], out, seen);
  }
  DRUG_DOSE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = DRUG_DOSE_RE.exec(blob))) {
    const scheme = match[3] ? ` ${match[3].replace(/–/g, "-")}` : "";
    addMed(out, seen, match[1], `${match[2]}${scheme}`);
  }
  return out.slice(0, 12);
}

export function mergeMedications(...groups: PatientMedication[][]): PatientMedication[] {
  const out: PatientMedication[] = [];
  const seen = new Set<string>();
  for (const group of groups) {
    for (const med of group) addMed(out, seen, med.name, med.dosage);
  }
  return out.slice(0, 12);
}

export function medicationsOf(summary: {
  leky?: PatientMedication[];
  srozumitelny_preklad?: string;
  doporuceny_postup?: string[];
}): PatientMedication[] {
  if (summary.leky?.length) return summary.leky;
  return parseMedicationsFromText(
    [summary.srozumitelny_preklad || "", ...(summary.doporuceny_postup || [])].join("\n"),
  );
}
