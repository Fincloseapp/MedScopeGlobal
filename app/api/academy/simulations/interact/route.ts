import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getSimulationBySlug } from "@/lib/academy/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type InteractBody = {
  simulationSlug?: string;
  simulationId?: string;
  action?: string;
  message?: string;
  choiceId?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = (await request.json()) as InteractBody;
    const slug = body.simulationSlug?.trim();
    if (!slug && !body.simulationId) {
      return NextResponse.json({ error: "simulationSlug or simulationId required" }, { status: 400 });
    }

    const simulation = slug
      ? await getSimulationBySlug(slug)
      : null;

    const scenario = (simulation?.scenario_json ?? {}) as Record<string, unknown>;
    const title = simulation?.title ?? "Klinická simulace";
    const difficulty = simulation?.difficulty ?? "intermediate";

    if (!isLlmConfigured()) {
      return NextResponse.json({
        ok: true,
        provider: "fallback",
        patientReply: "Pacient: „Dobrý den, doktore. Bolí mě na hrudi už od rána."",
        scoreDelta: 5,
        xpEarned: 10,
        nextChoices: [
          { id: "history", label: "Vyšetřit anamnézu" },
          { id: "ecg", label: "EKG" },
        ],
      });
    }

    const system = `Jsi AI pacient v klinické simulaci MedScope Academy (GROQ text-only).
Téma: ${title}, obtížnost: ${difficulty}.
Scénář: ${JSON.stringify(scenario).slice(0, 3000)}
Vrať JSON: {
  "patientReply": "odpověď pacienta v češtině",
  "clinicalFeedback": "stručná zpětná vazba lektorovi",
  "scoreDelta": 0-20,
  "xpEarned": 0-50,
  "nextChoices": [{"id":"...","label":"..."}],
  "completed": false
}`;

    const userPrompt = body.message?.trim()
      ? `Akce studenta: ${body.action ?? "message"}\nZpráva: ${body.message}`
      : `Volba studenta: ${body.choiceId ?? "start"}`;

    const raw = await generateJsonFromLlm({ system, user: userPrompt, maxTokens: 1500 });
    if (!raw) {
      return NextResponse.json({ ok: false, error: "AI response failed" }, { status: 503 });
    }

    const parsed = JSON.parse(raw) as {
      patientReply?: string;
      clinicalFeedback?: string;
      scoreDelta?: number;
      xpEarned?: number;
      nextChoices?: Array<{ id: string; label: string }>;
      completed?: boolean;
    };

    if (user && simulation?.id) {
      try {
        const admin = createServiceRoleClient();
        await admin.from("simulation_results").insert({
          user_id: user.id,
          simulation_id: simulation.id,
          action: body.action ?? body.choiceId ?? "interact",
          score_delta: parsed.scoreDelta ?? 0,
          xp_earned: parsed.xpEarned ?? 0,
          result_json: parsed,
        });
      } catch {
        /* table may not exist yet */
      }
    }

    return NextResponse.json({
      ok: true,
      provider: "groq",
      ...parsed,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
