import { NextResponse } from "next/server";
import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export const dynamic = "force-dynamic";

type ChatBody = {
  message?: string;
  lessonTitle?: string;
  lessonContent?: string;
  courseTitle?: string;
  history?: Array<{ role: string; content: string }>;
};

function buildFallbackReply(input: ChatBody): string {
  const topic = input.lessonTitle ?? "tato lekce";
  return `K tématu „${topic}": doporučuji projít si klíčové pojmy v textu lekce a ověřit znalosti v kvízu. Pro AI vysvětlení nastavte GROQ_API_KEY v prostředí MedScope Academy.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatBody;
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "message je povinný" }, { status: 400 });
    }

    if (!isLlmConfigured()) {
      return NextResponse.json({
        ok: true,
        reply: buildFallbackReply(body),
        provider: "fallback",
      });
    }

    const system = `Jsi AI lektor MedScope Academy — evropský medicínský tutor pro české studenty medicíny.
Kontext kurzu: ${body.courseTitle ?? "MedScope Academy"}
Lekce: ${body.lessonTitle ?? "—"}
Obsah lekce (výňatek): ${(body.lessonContent ?? "").slice(0, 2000)}

Odpovídej stručně, profesionálně, v češtině. Vysvětluj pojmy s klinickým kontextem. Neposkytuj konkrétní lékařské rady pacientům.`;

    const historyText = (body.history ?? [])
      .slice(-4)
      .map((m) => `${m.role === "user" ? "Student" : "Lektor"}: ${m.content}`)
      .join("\n");

    const user = historyText
      ? `${historyText}\nStudent: ${message}`
      : `Student: ${message}`;

    const reply = await generateTextFromLlm({ system, user, maxTokens: 800, temperature: 0.5 });

    return NextResponse.json({
      ok: true,
      reply: reply?.trim() || buildFallbackReply(body),
      provider: "groq",
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
