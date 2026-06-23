import { NextResponse } from "next/server";

import {

  getCoursesWithVideoMetadata,

  getLeaderboard,

  listPublishedLessons,

  listPublishedQuizzes,

} from "@/lib/academy/db";



export const dynamic = "force-dynamic";



/** Mobile sync endpoint — published academy content + video metadata per course */

export async function GET() {

  try {

    const [courses, lessons, quizzes, leaderboard] = await Promise.all([

      getCoursesWithVideoMetadata(50),

      listPublishedLessons(undefined, 200),

      listPublishedQuizzes(50),

      getLeaderboard("all_time", 20),

    ]);



    const lessonVideoMap = new Map<string, unknown>();

    for (const course of courses) {

      for (const vl of course.video_lessons ?? []) {

        lessonVideoMap.set(vl.lesson_id, {

          public_url: vl.public_url,

          thumbnail_url: vl.thumbnail_url,

          render_status: vl.render_status,

          duration_seconds: vl.duration_seconds,

        });

      }

    }



    const lessonsWithVideo = lessons.map((l) => ({

      ...l,

      video: l.video_asset_id ? lessonVideoMap.get(l.id) ?? null : null,

    }));



    return NextResponse.json({

      ok: true,

      version: "v35.0",

      syncedAt: new Date().toISOString(),

      courses,

      lessons: lessonsWithVideo,

      quizzes,

      leaderboard,

      videoCourseCount: courses.filter((c) => c.has_video).length,

    });

  } catch (e) {

    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });

  }

}

