import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export type MedicalReviewResult = {
  score: number;
  severity: "info" | "warning" | "critical";
  clinical_accuracy: { score: number; issues: string[] };
  guidelines: Array<{ source: string; status: "aligned" | "outdated" | "missing" | "conflict"; note: string }>;
  dosing_risks: string[];
  contraindications: string[];
  missing_sources: string[];
  outdated_content: string[];
  dangerous_content: string[];
  suggestions: string[];
  citations: string[];
};

const GUIDELINE_SOURCES = [
  "WHO (World Health Organization)",
  "ESC (European Society of Cardiology)",
  "EULAR (European Alliance of Associations for Rheumatology)",
  "CDC (Centers for Disease Control and Prevention)",
  "ČLS JEP (Česká lékařská společnost Jana Evangelisty Purkyně)",
  "ESMO (European Society for Medical Oncology)",
  "NICE (National Institute for Health and Care Excellence)",
];

function staticReview(title: string, content: string): MedicalReviewResult {
  const issues: string[] = [];
  if (!content || content.length < 100) issues.push("Obsah je příliš krátký pro klinickou kontrolu");
  if (!content.includes(".")) issues.push("Chybí větná struktura");

  const score = Math.max(0, 100 - issues.length * 20);
  return {
    score,
    severity: score >= 80 ? "info" : score >= 60 ? "warning" : "critical",
    clinical_accuracy: { score, issues },
    guidelines: GUIDELINE_SOURCES.slice(0, 3).map((s) => ({
      source: s,
      status: "missing" as const,
      note: "Automatická kontrola — doporučena manuální verifikace",
    })),
    dosing_risks: [],
    contraindications: [],
    missing_sources: ["Chybí explicitní citace guidelines"],
    outdated_content: [],
    dangerous_content: [],
    suggestions: issues.length
      ? ["Doplňte klinické reference a citace guidelines.", "Ověřte dávkování a kontraindikace."]
      : ["Obsah splňuje základní medicínskou strukturu."],
    citations: [],
  };
}

async function llmMedicalReview(input: {
  title: string;
  content: string;
  entityType: string;
}): Promise<MedicalReviewResult | null> {
  if (!isLlmConfigured()) return null;

  const guidelineList = GUIDELINE_SOURCES.join(", ");
  try {
    const text = await generateTextFromLlm({
      system: `Jsi klinický reviewer medicínského obsahu MedScope. Porovnávej s guidelines: ${guidelineList}. Detekuj zastaralý, nebezpečný nebo nepřesný obsah. Cituj zdroje. JSON:
{
  "score": 0-100,
  "severity": "info|warning|critical",
  "clinical_accuracy": {"score": 0-100, "issues": ["cs"]},
  "guidelines": [{"source": "WHO", "status": "aligned|outdated|missing|conflict", "note": "cs"}],
  "dosing_risks": ["cs"],
  "contraindications": ["cs"],
  "missing_sources": ["cs"],
  "outdated_content": ["cs"],
  "dangerous_content": ["cs"],
  "suggestions": ["cs"],
  "citations": ["cs"]
}`,
      user: `Typ: ${input.entityType}\nTitulek: ${input.title}\n\n${input.content.slice(0, 3500)}`,
      maxTokens: 1200,
      temperature: 0.15,
    });
    if (!text) return null;
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as MedicalReviewResult;
  } catch {
    return null;
  }
}

export async function reviewMedicalContent(input: {
  title: string;
  content: string;
  entityType: "lesson" | "course" | "article" | "video";
}): Promise<MedicalReviewResult> {
  return (
    (await llmMedicalReview(input)) ?? staticReview(input.title, input.content)
  );
}

export { GUIDELINE_SOURCES };
