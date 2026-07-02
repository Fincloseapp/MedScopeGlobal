import { NextResponse } from "next/server";
import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type EvaluateBody = {
  topic?: string;
  questions?: Array<{ id: string; question: string; options: string[]; correctIndex?: number }>;
  answers?: Record<string, number>;
  mode?: "mcq" | "osce" | "adaptive";
  difficulty?: "easy" | "medium" | "hard";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvaluateBody;
    const topic = body.topic?.trim() ?? "medicína";

    if (body.questions?.length && body.answers) {
      let correct = 0;
      for (const q of body.questions) {
        const ans = body.answers[q.id];
        if (typeof ans === "number" && ans === q.correctIndex) correct++;
      }
      const total = body.questions.length;
      const pct = Math.round((correct / total) * 100);
      return NextResponse.json({
        ok: true,
        mode: body.mode ?? "mcq",
        score: pct,
        correct,
        total,
        xpEarned: Math.round(pct / 2),
        feedback: pct >= 70 ? "Výborně!" : "Zkuste si projít téma znovu.",
      });
    }

    if (!isLlmConfigured()) {
      return NextResponse.json({
        ok: true,
        provider: "fallback",
        mode: body.mode ?? "mcq",
        questions: [
          {
            id: "q1",
            question: `Co je klíčové u tématu „${topic}"?`,
            options: ["Anamnéza", "Imaging", "Laboratoř", "Vše výše"],
            correctIndex: 3,
          },
        ],
      });
    }

    const system = `Jsi tvůrce medicínských testů MedScope Academy. Vrať JSON:
{
  "questions": [
    {"id":"q1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}
  ],
  "difficulty": "${body.difficulty ?? "medium"}"
}
5 otázek MCQ, česky, téma: ${topic}.`;

    const raw = await generateJsonFromLlm({
      system,
      user: `Vygeneruj ${body.mode ?? "mcq"} test pro: ${topic}`,
      maxTokens: 3000,
    });

    if (!raw) {
      return NextResponse.json({ ok: false, error: "Test generation failed" }, { status: 503 });
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json({
      ok: true,
      provider: "groq",
      mode: body.mode ?? "mcq",
      ...parsed,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
