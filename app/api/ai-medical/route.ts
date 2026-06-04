import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { checkAiDailyLimit, logAiAgentUsage } from "@/lib/security/ai-abuse";
import { runAiMedicalAssistant } from "@/lib/ai-medical/assistant";
import {
  AI_MEDICAL_ASSISTANTS,
  AI_MEDICAL_LANGUAGES,
  AI_MEDICAL_OUTPUT_TYPES,
} from "@/lib/ai-medical/types";

const schema = z.object({
  assistant: z.enum(AI_MEDICAL_ASSISTANTS),
  query: z.string().min(2).max(3000),
  language: z.enum(AI_MEDICAL_LANGUAGES).default("cs"),
  outputType: z.enum(AI_MEDICAL_OUTPUT_TYPES).default("professional"),
  specialty: z.string().max(64).optional(),
  diagnosis: z.string().max(64).optional(),
  studyType: z.string().max(64).optional(),
  drugName: z.string().max(128).optional(),
  legislationCategory: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    userId: user?.id,
    action: "ai_medical",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (user) {
    const limit = await checkAiDailyLimit(user.id);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Daily AI limit reached" }, { status: 429 });
    }
    await logAiAgentUsage({
      userId: user.id,
      agent: `ai-medical-${body.assistant}`,
      prompt: body.query,
      status: "ok",
    });
  }

  const result = await runAiMedicalAssistant(
    {
      assistant: body.assistant,
      query: sanitizeText(body.query, 3000),
      language: body.language,
      outputType: body.outputType,
      specialty: body.specialty,
      diagnosis: body.diagnosis,
      studyType: body.studyType,
      drugName: body.drugName,
      legislationCategory: body.legislationCategory,
    },
    user?.id
  );

  return NextResponse.json(result);
}
