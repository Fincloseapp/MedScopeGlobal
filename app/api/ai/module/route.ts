import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { checkAiDailyLimit, logAiAgentUsage } from "@/lib/security/ai-abuse";
import { extractWithAi, type V4cModule } from "@/lib/v4c/ai-extract";
import { resolveOpenAiKey } from "@/lib/ai/openai-key";
import { generateJsonFromLlm } from "@/lib/ai/chat-json";
import { categorizeMedicalText } from "@/lib/v4d/categorize";
import { detectLanguage } from "@/lib/v4d/filters";

const schema = z.object({
  module: z.enum([
    "studie",
    "leky",
    "legislativa",
    "digital-health",
    "newsletter",
    "kongresy",
    "novinky",
    "odborne",
  ]),
  query: z.string().min(2).max(2000),
});

const MODULE_HINTS: Record<string, string> = {
  studie: "Vyhledávání a shrnutí revmatologických studií (CZ, EU, svět, SÚKL).",
  leky: "Nové, schválené a připravované léky — EMA, FDA, SÚKL.",
  legislativa: "MZČR, SÚKL, ÚZIS, EU, DRG, kódy, úhrady.",
  "digital-health": "eHealth, AI health, telemedicína, wearables.",
  newsletter: "Generování newsletteru, PDF outline, layout.",
  kongresy: "Kongresy, kalendář, extrakce metadat.",
  novinky: "Novinky z univerzit CZ/EU/svět, revmatologie a výzkum.",
  odborne:
    "Odborné AI texty — univerzity CZ/SK/EU/svět, filtrace oborů, kvalita, překlady, shrnutí pro lékaře a pacienty.",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    userId: user?.id,
    action: "ai_module",
  });
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const query = sanitizeText(body.query, 2000);
  const mod = body.module as V4cModule | "kongresy" | "odborne";

  if (user) {
    const limit = await checkAiDailyLimit(user.id);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Daily AI limit reached" }, { status: 429 });
    }
    await logAiAgentUsage({
      userId: user.id,
      agent: `v4c-${mod}`,
      prompt: query,
      status: "ok",
    });
  }

  const extracted =
    mod === "odborne"
      ? await categorizeMedicalText({
          title: query,
          raw: query,
          specialty: "rheumatology",
          originalLanguage: detectLanguage(query),
        })
      : await extractWithAi(
          mod === "kongresy" ? "novinky" : (mod as V4cModule),
          { title: query, raw: query }
        );

  let reply = `${MODULE_HINTS[mod]}\n\n${JSON.stringify(extracted, null, 2)}`;

  const llmText = await generateJsonFromLlm({
    system: `MedScopeGlobal AI asistent — modul ${mod}. ${MODULE_HINTS[mod]} Odpověz česky, stručně.`,
    user: query,
    maxTokens: 1000,
  });
  if (llmText) {
    try {
      const parsed = JSON.parse(llmText) as { reply?: string };
      reply = parsed.reply ?? llmText;
    } catch {
      reply = llmText;
    }
  } else if (resolveOpenAiKey()) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resolveOpenAiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `MedScopeGlobal AI asistent — modul ${mod}. ${MODULE_HINTS[mod]}`,
          },
          { role: "user", content: query },
        ],
        max_tokens: 1000,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      reply = json.choices?.[0]?.message?.content ?? reply;
    }
  }

  return NextResponse.json({ reply, module: mod, extracted });
}
