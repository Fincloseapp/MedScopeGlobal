import { NextResponse } from "next/server";
import { z } from "zod";
import { recordLessonWatchProgress } from "@/lib/academy/b2b/quiz-engine";
import {
  physicianGateJsonError,
  requireVerifiedPhysician,
} from "@/lib/academy/b2b/verification";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  lesson_id: z.string().uuid(),
  current_time: z.number().min(0).max(86400),
  duration: z.number().min(0).max(86400),
  completed: z.boolean().optional(),
});

export async function POST(request: Request) {
  const gate = await requireVerifiedPhysician();
  if (!gate.ok) return physicianGateJsonError(gate);

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await recordLessonWatchProgress({
      userId: gate.userId,
      lessonId: parsed.data.lesson_id,
      currentTime: parsed.data.current_time,
      duration: parsed.data.duration,
      completed: parsed.data.completed,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
