/**
 * OrdiZapis note language — Whisper + structure prompts follow the edition,
 * not Czech, unless the edition is Czech.
 */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import {
  DOKUMENTACE_MODES,
  DOKUMENTACE_TEMPLATES,
  type DokumentaceMode,
  type DokumentaceTemplate,
} from "@/lib/lekari/dokumentace/templates";

export type WhisperLang = "cs" | "de" | "fr" | "it" | "es" | "pt" | "en";

export type DokumentaceNoteLanguage = {
  pack: ChromePack;
  whisper: WhisperLang;
  englishName: string;
  nativeName: string;
};

const LANG: Record<ChromePack, DokumentaceNoteLanguage> = {
  cs: { pack: "cs", whisper: "cs", englishName: "Czech", nativeName: "čeština" },
  de: { pack: "de", whisper: "de", englishName: "German", nativeName: "Deutsch" },
  fr: { pack: "fr", whisper: "fr", englishName: "French", nativeName: "français" },
  it: { pack: "it", whisper: "it", englishName: "Italian", nativeName: "italiano" },
  es: { pack: "es", whisper: "es", englishName: "Spanish", nativeName: "español" },
  "pt-BR": { pack: "pt-BR", whisper: "pt", englishName: "Portuguese", nativeName: "português" },
  en: { pack: "en", whisper: "en", englishName: "English", nativeName: "English" },
};

const STT_PROMPT: Record<ChromePack, string> = {
  cs:
    "Ambulantní vyšetření ve spisovné češtině. Rozhovor lékaře s pacientem. " +
    "Anamnéza, nynější onemocnění, osobní anamnéza, rodinná anamnéza, " +
    "farmakologická anamnéza, alergie, abúzus, objektivní nález, diagnóza, " +
    "terapie, doporučení, kontrola. Léky: Paralen, Ibalgin, Prednison, Warfarin, " +
    "Metformin, Amlodipin, Bisoprolol, Atorvastatin, Omeprazol. " +
    "Jednotky: mmHg, tepů/min, °C, mg, tbl.",
  de:
    "Ambulante Untersuchung auf Deutsch. Gespräch Arzt und Patient. " +
    "Anamnese, jetzige Beschwerden, Medikamente, Allergien, Befund, Diagnose, Therapie. " +
    "Einheiten: mmHg, /min, °C, mg.",
  fr:
    "Consultation ambulatoire en français. Entretien médecin–patient. " +
    "Anamnèse, maladie actuelle, traitements, allergies, examen, diagnostic, conduite à tenir. " +
    "Unités : mmHg, /min, °C, mg.",
  it:
    "Visita ambulatoriale in italiano. Colloquio medico–paziente. " +
    "Anamnesi, malattia attuale, farmaci, allergie, esame, diagnosi, terapia. " +
    "Unità: mmHg, /min, °C, mg.",
  es:
    "Consulta ambulatoria en español. Conversación médico–paciente. " +
    "Anamnesis, enfermedad actual, fármacos, alergias, exploración, diagnóstico, plan. " +
    "Unidades: mmHg, /min, °C, mg.",
  "pt-BR":
    "Consulta ambulatorial em português. Conversa médico–paciente. " +
    "Anamnese, doença atual, medicamentos, alergias, exame, diagnóstico, conduta. " +
    "Unidades: mmHg, /min, °C, mg.",
  en:
    "Outpatient visit in English. Clinician–patient dialogue. " +
    "History, presenting complaint, medicines, allergies, exam, diagnosis, plan. " +
    "Units: mmHg, /min, °C, mg.",
};

const CS_SYSTEM = `Jsi seniorní klinický dokumentarista OrdiZapis (MedScopeGlobal) pro české lékaře.
Piš výhradně spisovnou odbornou lékařskou češtinou — stylem hotového ambulantního / chorobopisného zápisu do NIS.

Cíl: gramaticky správný, terminologicky přesný a klinicky použitelný zápis — ne hovorový přepis ani stručný výcuc.

Jazyk a styl (povinné):
- Spisovná čeština s diakritikou; správné pády, shoda podmětu s přísudkem, rod a číslo.
- Klinický sloh ve 3. osobě (např. „Pacient udává…“, „Objektivně…“, „Doporučeno…“), ne tykání ani hovor („bolí mě“, „docela hodně“).
- Hovorové formulace pacienta převeď do odborné terminologie při zachování významu (např. „tlak“ → arteriální hypertenze jen pokud z kontextu vyplývá; jinak „bolest hlavy / elevace TK“ dle přepisu).
- Preferuj české lékařské termíny; latinské/anglické jen tam, kde jsou v české dokumentaci obvyklé (např. status praesens, dg., th.).
- Celé věty nebo ustálené klinické fráze; vyhýbej se heslům typu „bolest ++“ bez rozvedení, pokud přepis obsahuje více.
- Čísla, jednotky a léky zapisuj standardně (mg, tbl., 1-0-1, mmHg, tepů/min).

Obsahová pravidla:
1) Rozlišuj mluvčí: údaje od pacienta vs. lékaře; význam neměň.
2) Vyplň každou sekci šablony. Konkrétně: léky (název, síla, dávkování), trvání, lokalizace, charakter, faktory, asociované příznaky.
3) Nevymýšlej fakta, hodnoty ani diagnózy mimo přepis. Chybí-li sekce → „neuvedeno“.
4) U konzultace systematicky vytěž: NO, OA, RA, FA, AA, SA/PA, abúzus; gynekologickou anamnézu jen pokud zazněla.
5) Negativní údaje z přepisu uváděj („alergie neudává“, „nekuřák“).
6) Objektivní nález jen z přepisu; jinak „neuvedeno“.
7) Diagnóza / plán jen z přepisu; formuluj jako pracovní diagnózu / doporučení.
8) Do těla zápisu nedávej disclaimer ani meta-komentáře.
9) Výstup je návrh ke kontrole lékařem, ne autonomní diagnóza.`;

function otherSystem(lang: DokumentaceNoteLanguage): string {
  const missing =
    lang.pack === "fr"
      ? "non précisé"
      : lang.pack === "de"
        ? "nicht angegeben"
        : lang.pack === "it"
          ? "non indicato"
          : lang.pack === "es"
            ? "no indicado"
            : lang.pack === "pt-BR"
              ? "não informado"
              : "not stated";
  return `You are the senior clinical documenter for OrdiZapis (MedScopeGlobal).
Write the note exclusively in professional medical ${lang.englishName} (${lang.nativeName}) — a finished outpatient / chart note, not a chatty transcript.

Rules:
- Third person clinical style. Convert colloquial patient wording into clinical terms without changing meaning.
- Full sentences. Standard units (mg, mmHg, /min, °C).
- Fill every template section. If a section is absent from the transcript, write "${missing}".
- Do not invent facts, values or diagnoses that are not in the transcript.
- Distinguish what the patient said from what the clinician said.
- No disclaimer, no meta commentary, no Czech unless the transcript itself is Czech.
- The output is a draft for the clinician to review, not an autonomous diagnosis.
- SOAP headings S/O/A/P may stay as letters; the body of each section is ${lang.englishName}.`;
}

const TEMPLATE_OVERLAY: Partial<Record<ChromePack, Record<string, Pick<DokumentaceTemplate, "label" | "description" | "sections">>>> = {
  fr: {
    "ambulantni-zprava": {
      label: "Compte rendu ambulatoire",
      description: "Note ambulatoire standard",
      sections: [
        "Identification et motif",
        "Anamnèse",
        "Examen clinique",
        "Diagnostic / diagnostic de travail",
        "Conduite à tenir et traitement",
        "Contrôle / plan",
      ],
    },
    soap: {
      label: "SOAP",
      description: "Subjective · Objective · Assessment · Plan",
      sections: ["Subjective (S)", "Objective (O)", "Assessment (A)", "Plan (P)"],
    },
    anamneza: {
      label: "Anamnèse",
      description: "Anamnèse étendue",
      sections: [
        "Maladie actuelle",
        "Antécédents personnels",
        "Antécédents familiaux",
        "Traitements",
        "Allergies",
        "Contexte social et professionnel",
        "Consommations",
      ],
    },
    "propousteci-zprava": {
      label: "Compte rendu de sortie",
      description: "Synthèse d’hospitalisation et consignes de sortie",
      sections: [
        "Motif d’admission",
        "Évolution",
        "Examens réalisés",
        "Diagnostics",
        "Traitement de sortie",
        "Consignes et régime",
        "Contrôle",
      ],
    },
    specialista: {
      label: "Avis de spécialiste",
      description: "Avis spécialisé / de consultant",
      sections: [
        "Question du médecin adresseur",
        "Anamnèse utile à la spécialité",
        "Examen",
        "Conclusion",
        "Recommandations pour le médecin adresseur",
      ],
    },
    "prakticky-lekar": {
      label: "Médecin généraliste",
      description: "Note de consultation de médecine générale",
      sections: [
        "Motif de visite",
        "Plaintes",
        "Examen",
        "Diagnostic",
        "Traitement et conseils",
        "Suite",
      ],
    },
  },
  en: {
    "ambulantni-zprava": {
      label: "Outpatient note",
      description: "Standard outpatient visit note",
      sections: [
        "Identification and reason for visit",
        "History",
        "Examination",
        "Diagnosis / working diagnosis",
        "Plan and treatment",
        "Follow-up",
      ],
    },
    soap: {
      label: "SOAP",
      description: "Subjective · Objective · Assessment · Plan",
      sections: ["Subjective (S)", "Objective (O)", "Assessment (A)", "Plan (P)"],
    },
    anamneza: {
      label: "History",
      description: "Extended history",
      sections: [
        "Present illness",
        "Past history",
        "Family history",
        "Medicines",
        "Allergies",
        "Social and occupational history",
        "Substance use",
      ],
    },
    "propousteci-zprava": {
      label: "Discharge summary",
      description: "Hospital course and discharge advice",
      sections: [
        "Reason for admission",
        "Hospital course",
        "Investigations",
        "Diagnoses",
        "Discharge medicines",
        "Advice and regimen",
        "Follow-up",
      ],
    },
    specialista: {
      label: "Specialist report",
      description: "Consult / specialty assessment",
      sections: [
        "Referring question",
        "History relevant to the specialty",
        "Findings",
        "Impression",
        "Advice for the referring clinician",
      ],
    },
    "prakticky-lekar": {
      label: "General practice",
      description: "Primary-care visit note",
      sections: [
        "Reason for visit",
        "Symptoms",
        "Examination",
        "Diagnosis",
        "Treatment and advice",
        "Next step",
      ],
    },
  },
};

export function dokumentaceNoteLanguage(locale?: string | null): DokumentaceNoteLanguage {
  return LANG[chromePack(locale)];
}

export function whisperLanguage(locale?: string | null): WhisperLang {
  return dokumentaceNoteLanguage(locale).whisper;
}

export function sttPromptFor(locale?: string | null): string {
  return STT_PROMPT[chromePack(locale)];
}

export function structureSystemPrompt(locale?: string | null): string {
  const lang = dokumentaceNoteLanguage(locale);
  return lang.pack === "cs" ? CS_SYSTEM : otherSystem(lang);
}

export function localizedDokumentaceTemplate(
  template: DokumentaceTemplate,
  locale?: string | null
): DokumentaceTemplate {
  const pack = chromePack(locale);
  if (pack === "cs") return template;
  const overlay = (TEMPLATE_OVERLAY[pack] ?? TEMPLATE_OVERLAY.en)?.[template.id];
  if (!overlay) return template;
  return { ...template, ...overlay };
}

export function dokumentaceTemplatesForLocale(locale?: string | null): DokumentaceTemplate[] {
  return DOKUMENTACE_TEMPLATES.map((item) => localizedDokumentaceTemplate(item, locale));
}

export function structureModeHint(mode: DokumentaceMode, locale?: string | null): string {
  const lang = dokumentaceNoteLanguage(locale);
  if (lang.pack === "cs") {
    return mode === "dictation"
      ? "Režim: DIKTÁT lékaře (bez pacienta). Uspořádej diktát do plného klinického zápisu ve spisovné odborné češtině; oprav gramatiku a terminologii, nepřidávej nová fakta."
      : "Režim: KONZULTACE / rozhovor lékař–pacient. Systematicky vytěž všechny klinicky relevantní údaje. Převeď hovorovou češtinu pacienta do odborného zápisu; zachovej význam. Anamnéza musí být bohatá a použitelná v ordinaci.";
  }
  if (mode === "dictation") {
    return `Mode: clinician DICTATION (no patient). Turn the dictation into a full clinical note in professional ${lang.englishName}. Fix grammar and terms; do not add facts.`;
  }
  return `Mode: CONSULTATION / clinician–patient dialogue. Extract clinically relevant facts. Convert colloquial ${lang.englishName} into a professional note without changing meaning.`;
}

export function structureClosingLine(locale?: string | null): string {
  const lang = dokumentaceNoteLanguage(locale);
  if (lang.pack === "cs") {
    return "Sestav kompletní strukturovaný klinický zápis ve spisovné odborné lékařské češtině.";
  }
  return `Write the complete structured clinical note in professional medical ${lang.englishName} only.`;
}

const MODE_OVERLAY: Partial<
  Record<ChromePack, Record<DokumentaceMode, { label: string; description: string }>>
> = {
  fr: {
    dictation: { label: "Dictée", description: "Dictez après la visite → note clinique" },
    consultation: { label: "Consultation", description: "Enregistrez l’entretien avec le patient" },
    verbatim: { label: "Transcription brute", description: "Transcription nettoyée, sans modèle" },
  },
  de: {
    dictation: { label: "Diktat", description: "Nach der Untersuchung diktieren → klinische Notiz" },
    consultation: { label: "Gespräch", description: "Gespräch mit der Patientin / dem Patienten aufnehmen" },
    verbatim: { label: "Wörtliche Abschrift", description: "Bereinigte Abschrift ohne Vorlage" },
  },
  it: {
    dictation: { label: "Dettato", description: "Detta dopo la visita → nota clinica" },
    consultation: { label: "Visita", description: "Registra il colloquio con il paziente" },
    verbatim: { label: "Trascrizione integrale", description: "Trascrizione pulita, senza modello" },
  },
  es: {
    dictation: { label: "Dictado", description: "Dicte tras la visita → nota clínica" },
    consultation: { label: "Consulta", description: "Grabe la conversación con el paciente" },
    verbatim: { label: "Transcripción literal", description: "Transcripción limpia, sin plantilla" },
  },
  "pt-BR": {
    dictation: { label: "Ditado", description: "Dite após a consulta → nota clínica" },
    consultation: { label: "Consulta", description: "Grave a conversa com o paciente" },
    verbatim: { label: "Transcrição integral", description: "Transcrição limpa, sem modelo" },
  },
  en: {
    dictation: { label: "Dictation", description: "Dictate after the visit → clinical note" },
    consultation: { label: "Consult", description: "Record the clinician–patient conversation" },
    verbatim: { label: "Verbatim transcript", description: "Cleaned transcript without a template" },
  },
};

export function dokumentaceModesForLocale(locale?: string | null) {
  const pack = chromePack(locale);
  if (pack === "cs") return DOKUMENTACE_MODES;
  const overlay = MODE_OVERLAY[pack] ?? MODE_OVERLAY.en;
  return DOKUMENTACE_MODES.map((mode) => {
    const extra = overlay?.[mode.id];
    return extra ? { ...mode, ...extra } : mode;
  });
}

export function structureQualityLines(locale?: string | null): string {
  const lang = dokumentaceNoteLanguage(locale);
  if (lang.pack === "cs") {
    return `Požadavky na kvalitu a jazyk:
- Gramaticky správná odborná lékařská čeština (diakritika, pády, klinický sloh).
- Každá sekce: 2–8 vět podle obsahu přepisu (ne jedno slovo, pokud přepis obsahuje více).
- U léků: název, síla, dávkování, pokud zaznělo.
- U potíží: od kdy, průběh, intenzita, lokalizace, doprovodné příznaky.
- Odděl subjektivní údaje od objektivního nálezu, pokud šablona odděluje.
- Na konci nepřidávej obecné rady mimo přepis.
- Nepoužívej anglické věty (u SOAP ponech jen nadpisy S/O/A/P, obsah piš česky).`;
  }
  return `Quality and language:
- Professional medical ${lang.englishName} only (${lang.nativeName}).
- Each section: 2–8 sentences when the transcript has enough content.
- Medicines: name, strength, dosing when spoken.
- Complaints: onset, course, intensity, site, associated symptoms.
- Keep subjective history separate from exam findings when the template does.
- Do not add general advice that is not in the transcript.
- SOAP headings S/O/A/P may stay as letters; the body is ${lang.englishName}.
- Do not write Czech unless the transcript itself is Czech.`;
}
