import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { checkAiDailyLimit, logAiAgentUsage } from "@/lib/security/ai-abuse";
import { runAiMedicalAssistant } from "@/lib/ai-medical/assistant";
import { logAiMedicalInteraction } from "@/lib/ai-medical/log";
import { searchSupabaseForAssistant } from "@/lib/ai-medical/search";
import type { AiMedicalRequest, AiMedicalResponse } from "@/lib/ai-medical/types";
import {
  AI_MEDICAL_ASSISTANTS,
  AI_MEDICAL_LANGUAGES,
  AI_MEDICAL_OUTPUT_TYPES,
} from "@/lib/ai-medical/types";
import {
  generateJsonFromLlm,
  generateTextFromLlm,
  isLlmConfigured,
  resolvePrimaryLlmProvider,
} from "@/lib/ai/chat-json";
import {
  groqGenerateJson,
  isGroqConfigured,
  warnIfGroqKeyMissing,
} from "@/lib/ai/groq";
import { isBlockedSupabaseLimitationReply } from "@/lib/ai/reply-sanitize";

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

const LANG_NAMES: Record<string, string> = {
  cs: "čeština",
  sk: "slovenština",
  en: "angličtina",
};

const NO_SUPABASE_EXCUSE =
  "Nikdy nepiš o absenci záznamů, omezení Supabase ani kontextu databáze. Odpověz odborně z medicínských znalostí a uveď ověření u primárního zdroje.";

const ASSISTANT_SYSTEM: Record<string, string> = {
  doctor:
    "Jsi klinický AI asistent pro lékaře. Odpovídej evidence-based; využij přiložený kontext z databáze, pokud je k dispozici.",
  patient:
    "Jsi AI asistent pro pacienty. Piš srozumitelně, bez žargonu, s upozorněním konzultovat lékaře.",
  research:
    "Jsi výzkumný AI asistent. Zaměř se na metodologii, evidence level, limity studií.",
  legislativa:
    "Jsi legislativní AI asistent MZČR/SÚKL/ÚZIS/EU — přesné odkazy na zdroje.",
  leky:
    "Jsi farmakovigilanční AI asistent — EMA, FDA, SÚKL, indikace, bezpečnost.",
  studie:
    "Jsi asistent pro klinické studie — RCT, meta-analýzy, revmatologie a obory.",
  univerzity:
    "Jsi asistent pro univerzitní a výzkumné novinky CZ/SK/EU/svět.",
};

function hasGroqKey(): boolean {
  const k = process.env.GROQ_API_KEY?.trim();
  return Boolean(k && k.startsWith("gsk_") && k.length > 20) || isGroqConfigured();
}

function isUnwantedFallbackReply(text: string): boolean {
  return (
    isBlockedSupabaseLimitationReply(text) ||
    /vzhledem k (absenci|omezen)/i.test(text)
  );
}

/**
 * V5+ route-level Groq-first handler.
 * Chain: Groq models (lib/ai/groq) → Gemini → OpenAI via generateJsonFromLlm / generateTextFromLlm.
 */
async function runGroqModel(
  req: AiMedicalRequest,
  userId?: string | null
): Promise<AiMedicalResponse | null> {
  if (!hasGroqKey()) return null;
  warnIfGroqKeyMissing();

  const sources = await searchSupabaseForAssistant(req.assistant, req.query, {
    specialty: req.specialty,
    diagnosis: req.diagnosis,
    studyType: req.studyType,
    drugName: req.drugName,
    legislationCategory: req.legislationCategory,
  });

  const contextBlock = sources
    .map(
      (s, i) =>
        `[${i + 1}] ${s.source} | ${s.title}\n${s.snippet}${s.url ? `\nURL: ${s.url}` : ""}`
    )
    .join("\n\n");

  const outputGuide =
    req.outputType === "patient"
      ? "Piš pro pacienty — jednoduché věty."
      : "Piš odborně pro lékaře — strukturovaně.";

  const system = `${ASSISTANT_SYSTEM[req.assistant]}
${NO_SUPABASE_EXCUSE}
${outputGuide}
Jazyk: ${LANG_NAMES[req.language] ?? req.language}.
Vrať pouze validní JSON.`;

  const user = `Dotaz: ${req.query}

Kontext z databáze (${sources.length} záznamů):
${contextBlock || "(bez přímých shod — odpověz z obecné medicínské znalosti)"}

JSON:
{
  "reply": "hlavní odpověď",
  "summary": "krátké shrnutí",
  "recommendations": ["..."],
  "clinical_conclusions": ["..."],
  "graphic_summary": "přehled"
}`;

  let raw = await groqGenerateJson({ system, user, maxTokens: 2800 });
  if (!raw) raw = await generateJsonFromLlm({ system, user, maxTokens: 2800 });

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as {
        reply?: string;
        summary?: string;
        recommendations?: string[];
        clinical_conclusions?: string[];
        graphic_summary?: string;
      };
      const replyText = parsed.reply ?? raw;
      if (!isUnwantedFallbackReply(replyText)) {
        const response: AiMedicalResponse = {
          reply: replyText,
          summary: parsed.summary ?? "",
          recommendations: parsed.recommendations ?? [],
          clinicalConclusions: parsed.clinical_conclusions ?? [],
          graphicSummary: parsed.graphic_summary ?? "",
          sources,
          metadata: {
            llm_provider: resolvePrimaryLlmProvider(),
            primary_engine: "groq",
            route_mode: "groq_first",
          },
        };
        await logAiMedicalInteraction(req, response, userId);
        return response;
      }
    } catch {
      if (!isUnwantedFallbackReply(raw)) {
        const response: AiMedicalResponse = {
          reply: raw,
          summary: raw.slice(0, 400),
          recommendations: [],
          clinicalConclusions: [],
          graphicSummary: raw.slice(0, 500),
          sources,
          metadata: {
            llm_provider: resolvePrimaryLlmProvider(),
            primary_engine: "groq",
            route_mode: "groq_first_raw",
          },
        };
        await logAiMedicalInteraction(req, response, userId);
        return response;
      }
    }
  }

  const plainSystem = `${ASSISTANT_SYSTEM[req.assistant]}
${NO_SUPABASE_EXCUSE}
Jazyk: ${LANG_NAMES[req.language] ?? req.language}.`;
  const plainUser = `Dotaz: ${req.query}\n\nKontext:\n${contextBlock || "(obecná medicínská odpověď)"}`;
  const text = await generateTextFromLlm({
    system: plainSystem,
    user: plainUser,
    maxTokens: 2800,
  });

  if (text && !isUnwantedFallbackReply(text)) {
    const response: AiMedicalResponse = {
      reply: text,
      summary: text.slice(0, 400),
      recommendations: [],
      clinicalConclusions: [],
      graphicSummary: text.slice(0, 500),
      sources,
      metadata: {
        llm_provider: resolvePrimaryLlmProvider(),
        primary_engine: "groq",
        route_mode: "groq_plain_text",
      },
    };
    await logAiMedicalInteraction(req, response, userId);
    return response;
  }

  return null;
}

function buildRouteFallback(req: AiMedicalRequest, sources: AiMedicalResponse["sources"]): AiMedicalResponse {
  return {
    reply: `Dotaz „${req.query.slice(0, 120)}“ byl zpracován. Ověřte informace u primárního zdroje a konzultujte odborníka.`,
    summary: "Statický fallback — LLM nedostupný.",
    recommendations: ["Ověřte údaje vůči primárním zdrojům."],
    clinicalConclusions: [],
    graphicSummary: `[Fallback]\n${req.query.slice(0, 80)}`,
    sources,
    metadata: { fallback: true, llm_provider: "none" },
  };
}

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

  const medicalReq: AiMedicalRequest = {
    assistant: body.assistant,
    query: sanitizeText(body.query, 3000),
    language: body.language,
    outputType: body.outputType,
    specialty: body.specialty,
    diagnosis: body.diagnosis,
    studyType: body.studyType,
    drugName: body.drugName,
    legislationCategory: body.legislationCategory,
  };

  let result: AiMedicalResponse | null = null;

  if (hasGroqKey()) {
    result = await runGroqModel(medicalReq, user?.id);
  }

  if (!result || isUnwantedFallbackReply(result.reply)) {
    result = await runAiMedicalAssistant(medicalReq, user?.id);
    if (isUnwantedFallbackReply(result.reply) && hasGroqKey()) {
      const retry = await runGroqModel(medicalReq, user?.id);
      if (retry) result = retry;
    }
  }

  if (isUnwantedFallbackReply(result.reply)) {
    const sources = result.sources ?? [];
    result = buildRouteFallback(medicalReq, sources);
  }

  if (!isLlmConfigured() && result.metadata?.fallback) {
    result.metadata = {
      ...result.metadata,
      hint: "Nastavte GROQ_API_KEY na Vercel (https://console.groq.com).",
    };
  }

  result.metadata = {
    ...result.metadata,
    llm_provider: resolvePrimaryLlmProvider(),
    primary_engine: hasGroqKey() ? "groq" : resolvePrimaryLlmProvider(),
  };

  return NextResponse.json(result);
}
