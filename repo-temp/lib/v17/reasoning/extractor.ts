import type { ExtractedResult } from "@/lib/v17/reasoning/types";

const SYMPTOM_TERMS =
  /\b(bolest|pain|horečka|fever|kašel|cough|dyspn(ea|oe)|dušnost|únava|fatigue|zvracení|nausea|otok|swelling|rána|stiffness|zánět|inflammation)\b/gi;

const DIAGNOSIS_TERMS =
  /\b(revmatoidní artritida|rheumatoid arthritis|\bRA\b|diabetes|hypertension|hypertension|asthma|astma|lupus|SLE|CHF|heart failure|srdeční selhání|deprese|depression|cancer|karcinom|infarkt|stroke|mrtvice)\b/gi;

const TREATMENT_TERMS =
  /\b(methotrexate|metotrexát|prednisone|prednison|infliximab|adalimumab|metformin|insulin|aspirin|ibuprofen|antibiotik|antibiotic|chemotherapy|chemoterapie|radiotherapy|radioterapie|fyzioterapie|physiotherapy|léčba|treatment|terapie|therapy)\b/gi;

const RISK_TERMS =
  /\b(kouření|smoking|obezita|obesity|sedavý|sedentary|alkohol|alcohol|věk\s*\d+|age\s*\d+|family history|rodinná anamnéza|komorbidit|comorbid|immunosuppress)\b/gi;

const ENTITY_PATTERN =
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\b\d{2,3}(?:\.\d+)?\s*(?:mg|ml|mmol|%))\b/g;

function unique(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}

function matchTerms(text: string, pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const m of text.matchAll(pattern)) {
    if (m[0]) hits.push(m[0].trim());
  }
  return unique(hits);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

/** Heuristic clinical + entity extraction (placeholder, no external models). */
export async function extract(input: string): Promise<ExtractedResult> {
  const text = input.trim();
  if (!text) {
    return { symptoms: [], diagnoses: [], treatments: [], risks: [], facts: [] };
  }

  const normalized = text.replace(/\s+/g, " ");
  const sentences = splitSentences(normalized);

  const symptoms = matchTerms(normalized, SYMPTOM_TERMS);
  const diagnoses = matchTerms(normalized, DIAGNOSIS_TERMS);
  const treatments = matchTerms(normalized, TREATMENT_TERMS);
  const risks = matchTerms(normalized, RISK_TERMS);
  const entities = matchTerms(normalized, ENTITY_PATTERN);

  const facts = unique([
    ...sentences.slice(0, 5),
    ...entities.slice(0, 8).map((e) => `Entity: ${e}`),
  ]);

  return { symptoms, diagnoses, treatments, risks, facts };
}
