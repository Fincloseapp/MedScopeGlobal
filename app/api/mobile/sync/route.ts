import { NextResponse } from "next/server";
import {
  listPublishedCourses,
  listPublishedLessons,
  listPublishedQuizzes,
  getLeaderboard,
} from "@/lib/academy/db";

export const dynamic = "force-dynamic";

/** Mobile sync endpoint — returns published academy content bundle */
export async function GET() {
  try {
    const [courses, lessons, quizzes, leaderboard] = await Promise.all([
      listPublishedCourses(50),
      listPublishedLessons(undefined, 200),
      listPublishedQuizzes(50),
      getLeaderboard("all_time", 20),
    ]);

    return NextResponse.json({
      ok: true,
      version: "v35.0",
      syncedAt: new Date().toISOString(),
      courses,
      lessons,
      quizzes,
      leaderboard,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
