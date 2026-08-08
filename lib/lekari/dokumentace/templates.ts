/** Hard cap: 60 minutes continuous recording in the app. */
export const DOKUMENTACE_MAX_RECORD_MS = 60 * 60 * 1000;
/** Whisper API hard limit (~25 MB). Keep segments under this. */
export const DOKUMENTACE_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
/**
 * Rotate MediaRecorder every 2 minutes so each upload stays under Vercel ~4.5 MB body limit.
 * (Phone MediaRecorder often ignores bitrate hints and records much larger files.)
 */
export const DOKUMENTACE_SEGMENT_MS = 2 * 60 * 1000;
/** Target bitrate — prefer small segments for reliable mobile upload. */
export const DOKUMENTACE_AUDIO_BITS_PER_SECOND = 16_000;
/** Soft client upload cap per segment (under platform gateway limits). */
export const DOKUMENTACE_SOFT_UPLOAD_BYTES = 3_500_000;

export type DokumentaceMode = "consultation" | "dictation" | "verbatim";

export type DokumentaceTemplateId =
  | "ambulantni-zprava"
  | "soap"
  | "anamneza"
  | "propousteci-zprava"
  | "specialista"
  | "prakticky-lekar";

export type DokumentaceTemplate = {
  id: DokumentaceTemplateId;
  label: string;
  description: string;
  sections: string[];
};

export const DOKUMENTACE_MODES: {
  id: DokumentaceMode;
  label: string;
  description: string;
}[] = [
  {
    id: "consultation",
    label: "Konzultace",
    description: "Nahrávka rozhovoru s pacientem → strukturovaný zápis",
  },
  {
    id: "dictation",
    label: "Diktát",
    description: "Lékař diktuje nález bez pacienta",
  },
  {
    id: "verbatim",
    label: "Doslovný přepis",
    description: "Vyčištěný přepis bez strukturování do šablony",
  },
];

export const DOKUMENTACE_TEMPLATES: DokumentaceTemplate[] = [
  {
    id: "ambulantni-zprava",
    label: "Ambulantní zpráva",
    description: "Standardní ambulantní zápis z vyšetření",
    sections: [
      "Identifikace a důvod návštěvy",
      "Anamnéza (OA, RA, FA, AA, NO)",
      "Objektivní nález",
      "Diagnóza / pracovní diagnóza",
      "Doporučení a léčba",
      "Kontrola / plán",
    ],
  },
  {
    id: "soap",
    label: "SOAP",
    description: "Subjective · Objective · Assessment · Plan",
    sections: ["Subjective (S)", "Objective (O)", "Assessment (A)", "Plan (P)"],
  },
  {
    id: "anamneza",
    label: "Anamnéza",
    description: "Rozšířený anamnestický zápis",
    sections: [
      "Nynější onemocnění",
      "Osobní anamnéza",
      "Rodinná anamnéza",
      "Farmakologická anamnéza",
      "Alergická anamnéza",
      "Sociální a pracovní anamnéza",
      "Abúzus",
    ],
  },
  {
    id: "propousteci-zprava",
    label: "Propouštěcí zpráva",
    description: "Souhrn hospitalizace a doporučení při propuštění",
    sections: [
      "Důvod přijetí",
      "Průběh hospitalizace",
      "Provedená vyšetření",
      "Diagnózy",
      "Medikace při propuštění",
      "Doporučení a režim",
      "Kontrola",
    ],
  },
  {
    id: "specialista",
    label: "Zpráva specialisty",
    description: "Konziliární / specializované vyšetření",
    sections: [
      "Žádost / otázka odesílajícího lékaře",
      "Anamnéza relevantní ke specializaci",
      "Nález",
      "Závěr",
      "Doporučení pro praktického / odesílajícího lékaře",
    ],
  },
  {
    id: "prakticky-lekar",
    label: "Praktický lékař",
    description: "Zápis z ordinace praktického lékaře",
    sections: [
      "Důvod návštěvy",
      "Subjektivní potíže",
      "Objektivní vyšetření",
      "Diagnóza",
      "Terapie a poučení",
      "Další postup",
    ],
  },
];

export function getDokumentaceTemplate(
  id: string | undefined | null
): DokumentaceTemplate {
  const found = DOKUMENTACE_TEMPLATES.find((t) => t.id === id);
  return found ?? DOKUMENTACE_TEMPLATES[0];
}
