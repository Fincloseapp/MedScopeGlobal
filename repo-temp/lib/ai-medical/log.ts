import { createServiceRoleClient } from "@/lib/supabase/service";
import type { AiMedicalRequest, AiMedicalResponse } from "@/lib/ai-medical/types";

export async function logAiMedicalInteraction(
  req: AiMedicalRequest,
  response: AiMedicalResponse,
  userId?: string | null
) {
  try {
    const admin = createServiceRoleClient();
    await admin.from("ai_medical_logs").insert({
      user_id: userId ?? null,
      assistant_type: req.assistant,
      query: req.query,
      response: response.reply,
      language: req.language,
      output_type: req.outputType,
      specialty: req.specialty ?? null,
      metadata: {
        summary: response.summary,
        recommendations: response.recommendations,
        clinical_conclusions: response.clinicalConclusions,
        graphic_summary: response.graphicSummary,
        sources_count: response.sources.length,
        filters: {
          diagnosis: req.diagnosis,
          studyType: req.studyType,
          drugName: req.drugName,
          legislationCategory: req.legislationCategory,
        },
        ...response.metadata,
      },
    });
  } catch (e) {
    console.error("logAiMedicalInteraction", e);
  }
}
