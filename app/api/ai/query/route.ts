import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkAiDailyLimit,
  detectSpam,
  detectToxicity,
  logAiAgentUsage,
} from "@/lib/security/ai-abuse";
import { withApiGuard } from "@/lib/security/api-guard";
import { sanitizeText } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/security-log";
import { getClientIp } from "@/lib/security/client-ip";
import { z } from "zod";

const querySchema = z.object({
  query: z.string().min(1).max(2000),
  agent: z.string().default("medscope-assistant"),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guard = await withApiGuard(request, {
    requireCaptcha: false,
    userId: user?.id,
    action: "ai_query",
  });
  if (!guard.ok) return guard.response;

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const ip = getClientIp(request);

  let body: z.infer<typeof querySchema>;
  try {
    body = querySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const query = sanitizeText(body.query, 2000);
  const toxicity = detectToxicity(query);
  const spam = detectSpam(query);

  if (toxicity >= 0.5 || spam >= 0.8) {
    await logAiAgentUsage({
      userId: user.id,
      agent: body.agent,
      prompt: query,
      status: "blocked",
    });
    await logSecurityEvent({
      ip,
      userId: user.id,
      action: "ai_query:content_blocked",
      status: "blocked",
      details: { toxicity, spam },
    });
    return NextResponse.json({ error: "Query blocked by content policy" }, { status: 403 });
  }

  const limit = await checkAiDailyLimit(user.id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Daily AI query limit reached (20/day)", remaining: 0 },
      { status: 429 }
    );
  }

  await logAiAgentUsage({
    userId: user.id,
    agent: body.agent,
    prompt: query,
    status: "ok",
  });

  // Placeholder — actual AI call uses server-side OPENAI_API_KEY only
  const { resolveOpenAiKey } = await import("@/lib/ai/openai-key");
  const apiKey = resolveOpenAiKey();
  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      answer:
        "AI služba není momentálně nakonfigurována. Dotaz byl zaznamenán pro audit.",
      remaining: limit.remaining - 1,
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Jsi medicínský asistent MedScopeGlobal. Odpovídej stručně, evidence-based, v češtině. Neposkytuj diagnózy — doporuč konzultaci s lékařem.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 500,
      }),
    });

    const data = await res.json();
    const answer =
      data.choices?.[0]?.message?.content ??
      "Nepodařilo se získat odpověď.";

    await logAiAgentUsage({
      userId: user.id,
      agent: body.agent,
      prompt: query,
      tokensUsed: data.usage?.total_tokens,
      status: "ok",
    });

    return NextResponse.json({
      ok: true,
      answer,
      remaining: limit.remaining - 1,
    });
  } catch (err) {
    await logSecurityEvent({
      ip,
      userId: user.id,
      action: "ai_query:error",
      status: "error",
      details: { error: err instanceof Error ? err.message : "unknown" },
    });
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
