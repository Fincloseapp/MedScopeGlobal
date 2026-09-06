import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import type { AiMedicalAssistant } from "@/lib/ai-medical/types";

export type AiMedicalDesk = {
  title: string;
  lead: string;
};

export type AiMedicalHubCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  assistants: Record<AiMedicalAssistant, string>;
  desks: Record<AiMedicalAssistant, AiMedicalDesk>;
  errorAi: string;
  errorGeneric: string;
};

const PACK: Record<ChromePack, AiMedicalHubCopy> = {
  cs: {
    metaTitle: "AI Medical Intelligence",
    metaDescription:
      "Sedm specializovaných AI asistentů — lékař, pacient, výzkum, legislativa, léky, studie, univerzity.",
    eyebrow: "AI Medical Intelligence",
    title: "AI Medical Intelligence",
    lead: "Vyhledávání v databázi a odborné texty. Překlady CZ/SK/EN. Engine: Groq → Gemini → OpenAI.",
    assistants: {
      doctor: "AI asistent pro lékaře",
      patient: "AI asistent pro pacienty",
      research: "AI asistent pro výzkum",
      legislativa: "AI asistent pro legislativu",
      leky: "AI asistent pro léky",
      studie: "AI asistent pro studie",
      univerzity: "AI asistent pro univerzitní výzkum",
    },
    desks: {
      doctor: {
        title: "AI asistent pro lékaře",
        lead: "Odborné shrnutí, klinické závěry, doporučení a přehledy z databáze studií a článků.",
      },
      patient: {
        title: "AI asistent pro pacienty",
        lead: "Srozumitelná shrnutí, doporučení a přehledy — vždy s konzultací lékaře.",
      },
      research: {
        title: "AI asistent pro výzkum",
        lead: "Meta-analýzy, RCT, evidence level, metodologie a výzkumné přehledy.",
      },
      legislativa: {
        title: "AI asistent pro legislativu",
        lead: "MZČR, SÚKL, ÚZIS, EU — filtrace podle kategorie legislativy.",
      },
      leky: {
        title: "AI asistent pro léky",
        lead: "EMA, FDA, SÚKL — filtrace podle názvu léku a farmakovigilance.",
      },
      studie: {
        title: "AI asistent pro studie",
        lead: "Klinické studie, diagnózy, typy studií a úrovně důkazů.",
      },
      univerzity: {
        title: "AI asistent pro univerzitní výzkum",
        lead: "Novinky z lékařských fakult a výzkumných center.",
      },
    },
    errorAi: "Chyba AI",
    errorGeneric: "Chyba",
  },
  de: {
    metaTitle: "AI Medical Intelligence",
    metaDescription:
      "Sieben spezialisierte KI-Assistenten — Arzt, Patient, Forschung, Recht, Arzneimittel, Studien, Hochschulen.",
    eyebrow: "AI Medical Intelligence",
    title: "AI Medical Intelligence",
    lead: "Suche in der Datenbank und Fachtexte. Übersetzungen CS/SK/EN. Engine: Groq → Gemini → OpenAI.",
    assistants: {
      doctor: "KI-Assistent für Ärztinnen",
      patient: "KI-Assistent für Patientinnen",
      research: "KI-Assistent für Forschung",
      legislativa: "KI-Assistent für Recht",
      leky: "KI-Assistent für Arzneimittel",
      studie: "KI-Assistent für Studien",
      univerzity: "KI-Assistent für Hochschulforschung",
    },
    desks: {
      doctor: {
        title: "KI-Assistent für Ärztinnen",
        lead: "Fachliche Kurzfassung, klinische Schlüsse und Übersicht aus Studien und Artikeln.",
      },
      patient: {
        title: "KI-Assistent für Patientinnen",
        lead: "Verständliche Kurzfassungen — immer mit Rücksprache beim Arzt.",
      },
      research: {
        title: "KI-Assistent für Forschung",
        lead: "Metaanalysen, RCT, Evidenzgrad und Methodik.",
      },
      legislativa: {
        title: "KI-Assistent für Recht",
        lead: "Tschechische und EU-Quellen — Filter nach Rechtskategorie.",
      },
      leky: {
        title: "KI-Assistent für Arzneimittel",
        lead: "EMA, FDA, SÚKL — Filter nach Präparat und Pharmakovigilanz.",
      },
      studie: {
        title: "KI-Assistent für Studien",
        lead: "Klinische Studien, Diagnosen, Studientypen und Evidenz.",
      },
      univerzity: {
        title: "KI-Assistent für Hochschulforschung",
        lead: "Nachrichten von medizinischen Fakultäten und Forschungszentren.",
      },
    },
    errorAi: "KI-Fehler",
    errorGeneric: "Fehler",
  },
  fr: {
    metaTitle: "AI Medical Intelligence",
    metaDescription:
      "Sept assistants IA — médecin, patient, recherche, droit, médicaments, études, universités.",
    eyebrow: "AI Medical Intelligence",
    title: "AI Medical Intelligence",
    lead: "Recherche en base et textes spécialisés. Traductions CS/SK/EN. Moteur : Groq → Gemini → OpenAI.",
    assistants: {
      doctor: "Assistant IA pour les médecins",
      patient: "Assistant IA pour les patients",
      research: "Assistant IA pour la recherche",
      legislativa: "Assistant IA pour le droit",
      leky: "Assistant IA pour les médicaments",
      studie: "Assistant IA pour les études",
      univerzity: "Assistant IA pour la recherche universitaire",
    },
    desks: {
      doctor: {
        title: "Assistant IA pour les médecins",
        lead: "Synthèse, conclusions cliniques et aperçus à partir des études et articles.",
      },
      patient: {
        title: "Assistant IA pour les patients",
        lead: "Synthèses claires — toujours à confirmer avec un médecin.",
      },
      research: {
        title: "Assistant IA pour la recherche",
        lead: "Méta-analyses, ECR, niveau de preuve et méthodologie.",
      },
      legislativa: {
        title: "Assistant IA pour le droit",
        lead: "Sources tchèques et UE — filtre par catégorie juridique.",
      },
      leky: {
        title: "Assistant IA pour les médicaments",
        lead: "EMA, FDA, SÚKL — filtre par nom et pharmacovigilance.",
      },
      studie: {
        title: "Assistant IA pour les études",
        lead: "Études cliniques, diagnostics, types d’étude et preuves.",
      },
      univerzity: {
        title: "Assistant IA pour la recherche universitaire",
        lead: "Actualités des facultés de médecine et des centres de recherche.",
      },
    },
    errorAi: "Erreur IA",
    errorGeneric: "Erreur",
  },
  en: {
    metaTitle: "AI Medical Intelligence",
    metaDescription:
      "Seven specialised AI assistants — physician, patient, research, law, medicines, studies, universities.",
    eyebrow: "AI Medical Intelligence",
    title: "AI Medical Intelligence",
    lead: "Database search and specialist text. CS/SK/EN translations. Engine: Groq → Gemini → OpenAI.",
    assistants: {
      doctor: "AI assistant for physicians",
      patient: "AI assistant for patients",
      research: "AI assistant for research",
      legislativa: "AI assistant for law",
      leky: "AI assistant for medicines",
      studie: "AI assistant for studies",
      univerzity: "AI assistant for university research",
    },
    desks: {
      doctor: {
        title: "AI assistant for physicians",
        lead: "Specialist summary, clinical conclusions and overviews from studies and articles.",
      },
      patient: {
        title: "AI assistant for patients",
        lead: "Plain-language summaries — always check with a physician.",
      },
      research: {
        title: "AI assistant for research",
        lead: "Meta-analyses, RCTs, evidence level and methods.",
      },
      legislativa: {
        title: "AI assistant for law",
        lead: "Czech and EU sources — filter by legal category.",
      },
      leky: {
        title: "AI assistant for medicines",
        lead: "EMA, FDA, SÚKL — filter by product name and pharmacovigilance.",
      },
      studie: {
        title: "AI assistant for studies",
        lead: "Clinical studies, diagnoses, study types and evidence.",
      },
      univerzity: {
        title: "AI assistant for university research",
        lead: "News from medical faculties and research centres.",
      },
    },
    errorAi: "AI error",
    errorGeneric: "Error",
  },
  it: {
    metaTitle: "AI Medical Intelligence",
    metaDescription:
      "Sette assistenti IA — medico, paziente, ricerca, diritto, farmaci, studi, università.",
    eyebrow: "AI Medical Intelligence",
    title: "AI Medical Intelligence",
    lead: "Ricerca in banca dati e testi specialistici. Traduzioni CS/SK/EN. Motore: Groq → Gemini → OpenAI.",
    assistants: {
      doctor: "Assistente IA per i medici",
      patient: "Assistente IA per i pazienti",
      research: "Assistente IA per la ricerca",
      legislativa: "Assistente IA per il diritto",
      leky: "Assistente IA per i farmaci",
      studie: "Assistente IA per gli studi",
      univerzity: "Assistente IA per la ricerca universitaria",
    },
    desks: {
      doctor: {
        title: "Assistente IA per i medici",
        lead: "Sintesi, conclusioni cliniche e panoramiche da studi e articoli.",
      },
      patient: {
        title: "Assistente IA per i pazienti",
        lead: "Sintesi chiare — sempre da confermare con un medico.",
      },
      research: {
        title: "Assistente IA per la ricerca",
        lead: "Meta-analisi, RCT, livello di evidenza e metodi.",
      },
      legislativa: {
        title: "Assistente IA per il diritto",
        lead: "Fonti ceche e UE — filtro per categoria giuridica.",
      },
      leky: {
        title: "Assistente IA per i farmaci",
        lead: "EMA, FDA, SÚKL — filtro per nome e farmacovigilanza.",
      },
      studie: {
        title: "Assistente IA per gli studi",
        lead: "Studi clinici, diagnosi, tipi di studio ed evidenze.",
      },
      univerzity: {
        title: "Assistente IA per la ricerca universitaria",
        lead: "Novità dalle facoltà di medicina e dai centri di ricerca.",
      },
    },
    errorAi: "Errore IA",
    errorGeneric: "Errore",
  },
  es: {
    metaTitle: "AI Medical Intelligence",
    metaDescription:
      "Siete asistentes de IA — médico, paciente, investigación, derecho, medicamentos, estudios, universidades.",
    eyebrow: "AI Medical Intelligence",
    title: "AI Medical Intelligence",
    lead: "Búsqueda en la base y textos especializados. Traducciones CS/SK/EN. Motor: Groq → Gemini → OpenAI.",
    assistants: {
      doctor: "Asistente IA para médicos",
      patient: "Asistente IA para pacientes",
      research: "Asistente IA para investigación",
      legislativa: "Asistente IA para derecho",
      leky: "Asistente IA para medicamentos",
      studie: "Asistente IA para estudios",
      univerzity: "Asistente IA para investigación universitaria",
    },
    desks: {
      doctor: {
        title: "Asistente IA para médicos",
        lead: "Síntesis, conclusiones clínicas y panoramas a partir de estudios y artículos.",
      },
      patient: {
        title: "Asistente IA para pacientes",
        lead: "Síntesis claras — siempre con consulta médica.",
      },
      research: {
        title: "Asistente IA para investigación",
        lead: "Metanálisis, ECA, nivel de evidencia y métodos.",
      },
      legislativa: {
        title: "Asistente IA para derecho",
        lead: "Fuentes checas y de la UE — filtro por categoría jurídica.",
      },
      leky: {
        title: "Asistente IA para medicamentos",
        lead: "EMA, FDA, SÚKL — filtro por nombre y farmacovigilancia.",
      },
      studie: {
        title: "Asistente IA para estudios",
        lead: "Estudios clínicos, diagnósticos, tipos de estudio y evidencia.",
      },
      univerzity: {
        title: "Asistente IA para investigación universitaria",
        lead: "Novedades de facultades de medicina y centros de investigación.",
      },
    },
    errorAi: "Error de IA",
    errorGeneric: "Error",
  },
  "pt-BR": {
    metaTitle: "AI Medical Intelligence",
    metaDescription:
      "Sete assistentes de IA — médico, paciente, investigação, direito, medicamentos, estudos, universidades.",
    eyebrow: "AI Medical Intelligence",
    title: "AI Medical Intelligence",
    lead: "Pesquisa na base e textos especializados. Traduções CS/SK/EN. Motor: Groq → Gemini → OpenAI.",
    assistants: {
      doctor: "Assistente IA para médicos",
      patient: "Assistente IA para pacientes",
      research: "Assistente IA para investigação",
      legislativa: "Assistente IA para direito",
      leky: "Assistente IA para medicamentos",
      studie: "Assistente IA para estudos",
      univerzity: "Assistente IA para investigação universitária",
    },
    desks: {
      doctor: {
        title: "Assistente IA para médicos",
        lead: "Síntese, conclusões clínicas e panoramas a partir de estudos e artigos.",
      },
      patient: {
        title: "Assistente IA para pacientes",
        lead: "Sínteses claras — sempre com consulta médica.",
      },
      research: {
        title: "Assistente IA para investigação",
        lead: "Meta-análises, ECR, nível de evidência e métodos.",
      },
      legislativa: {
        title: "Assistente IA para direito",
        lead: "Fontes checas e da UE — filtro por categoria jurídica.",
      },
      leky: {
        title: "Assistente IA para medicamentos",
        lead: "EMA, FDA, SÚKL — filtro por nome e farmacovigilância.",
      },
      studie: {
        title: "Assistente IA para estudos",
        lead: "Estudos clínicos, diagnósticos, tipos de estudo e evidência.",
      },
      univerzity: {
        title: "Assistente IA para investigação universitária",
        lead: "Novidades de faculdades de medicina e centros de investigação.",
      },
    },
    errorAi: "Erro de IA",
    errorGeneric: "Erro",
  },
};

export function getAiMedicalHubCopy(locale?: string | null): AiMedicalHubCopy {
  return PACK[chromePack(locale)];
}
