export const AI_MEDICAL_ASSISTANTS = [
  "doctor",
  "patient",
  "research",
  "legislativa",
  "leky",
  "studie",
  "univerzity",
] as const;

export type AiMedicalAssistant = (typeof AI_MEDICAL_ASSISTANTS)[number];

export const AI_MEDICAL_LANGUAGES = ["cs", "sk", "en"] as const;
export type AiMedicalLanguage = (typeof AI_MEDICAL_LANGUAGES)[number];

export const AI_MEDICAL_OUTPUT_TYPES = ["professional", "patient"] as const;
export type AiMedicalOutputType = (typeof AI_MEDICAL_OUTPUT_TYPES)[number];

export const ASSISTANT_LABELS_CS: Record<AiMedicalAssistant, string> = {
  doctor: "AI asistent pro lékaře",
  patient: "AI asistent pro pacienty",
  research: "AI asistent pro výzkum",
  legislativa: "AI asistent pro legislativu",
  leky: "AI asistent pro léky",
  studie: "AI asistent pro studie",
  univerzity: "AI asistent pro univerzitní výzkum",
};

export const ASSISTANT_ROUTES: Record<AiMedicalAssistant, string> = {
  doctor: "/ai-medical/doctor",
  patient: "/ai-medical/patient",
  research: "/ai-medical/research",
  legislativa: "/ai-medical/legislativa",
  leky: "/ai-medical/leky",
  studie: "/ai-medical/studie",
  univerzity: "/ai-medical/univerzity",
};

export type AiMedicalRequest = {
  assistant: AiMedicalAssistant;
  query: string;
  language: AiMedicalLanguage;
  outputType: AiMedicalOutputType;
  specialty?: string;
  diagnosis?: string;
  studyType?: string;
  drugName?: string;
  legislationCategory?: string;
};

export type AiMedicalSearchHit = {
  source: string;
  id: string;
  title: string;
  snippet: string;
  url?: string | null;
  meta?: Record<string, unknown>;
};

export type AiMedicalResponse = {
  reply: string;
  summary: string;
  recommendations: string[];
  clinicalConclusions: string[];
  graphicSummary: string;
  sources: AiMedicalSearchHit[];
  metadata: Record<string, unknown>;
};
