import { NextResponse } from "next/server";
import { runSlideshowPipeline } from "@/lib/v25/video/slideshow-pipeline";
import { isGroqConfigured, resolveAiModel } from "@/lib/ai/groq-client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { topic?: string; lessonId?: string };
    if (!body.topic?.trim()) {
      return NextResponse.json({ error: "topic required" }, { status: 400 });
    }

    const result = await runSlideshowPipeline({
      topic: body.topic.trim(),
      lessonId: body.lessonId,
    });

    return NextResponse.json({
      ...result,
      model: resolveAiModel(),
      groqConfigured: isGroqConfigured(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
