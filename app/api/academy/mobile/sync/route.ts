import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLeaderboard,
  getUserProgress,
  listPublishedCourses,
  listPublishedQuizzes,
} from "@/lib/academy/db";

export const dynamic = "force-dynamic";

/** Mobile app sync endpoint — returns catalog + user progress snapshot */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();

    const [courses, quizzes, leaderboard] = await Promise.all([
      listPublishedCourses(50),
      listPublishedQuizzes(50),
      getLeaderboard("all_time", 10),
    ]);

    let progress: unknown[] = [];
    if (auth.user) {
      progress = await getUserProgress(auth.user.id);
    }

    return NextResponse.json({
      ok: true,
      version: "v35.0",
      syncedAt: new Date().toISOString(),
      courses,
      quizzes,
      leaderboard,
      progress,
      userId: auth.user?.id ?? null,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
