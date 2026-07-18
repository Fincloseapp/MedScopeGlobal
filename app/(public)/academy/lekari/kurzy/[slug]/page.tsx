import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CmeLessonQuizSection } from "@/components/academy/b2b/cme-lesson-quiz-section";
import { CmeQuizPlayer } from "@/components/academy/b2b/cme-quiz-player";
import { getAccreditedCourseBySlug } from "@/lib/academy/b2b/db";
import {
  isVerifiedPhysician,
  getPhysicianProfile,
  requireVerifiedPhysician,
} from "@/lib/academy/b2b/verification";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const course = await getAccreditedCourseBySlug(slug);
  return {
    title: course
      ? `${course.title} — Lékařská zóna`
      : "Kurz — Lékařská zóna",
  };
}

export default async function CmeCoursePage({ params }: Params) {
  const gate = await requireVerifiedPhysician();
  if (!gate.ok) {
    if (gate.status === 401) {
      redirect(`/login?next=/academy/lekari/kurzy/${(await params).slug}`);
    }
    redirect("/academy/lekari/overeni");
  }

  const { slug } = await params;
  const course = await getAccreditedCourseBySlug(slug);
  if (!course) notFound();

  const profile = await getPhysicianProfile(gate.userId);
  if (!isVerifiedPhysician(profile)) redirect("/academy/lekari/overeni");

  const admin = createServiceRoleClient();
  const { data: lessons } = await admin
    .from("lessons")
    .select("id, title, slug, sort_order, video_asset_id, lock_forward, article_body, content")
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const { data: quiz } = await admin
    .from("quizzes")
    .select("id, title, passing_score, lesson_id")
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const primaryLesson = lessons?.[0] ?? null;
  let videoUrl: string | null = null;
  let poster: string | null = null;

  if (primaryLesson?.video_asset_id) {
    const { data: video } = await admin
      .from("video_assets")
      .select("metadata")
      .eq("id", primaryLesson.video_asset_id)
      .maybeSingle();
    const meta = (video?.metadata ?? {}) as {
      public_url?: string;
      mp4_url?: string;
      thumbnail_url?: string;
    };
    videoUrl = meta.public_url ?? meta.mp4_url ?? null;
    poster = meta.thumbnail_url ?? null;
  }

  const { data: watch } = primaryLesson
    ? await admin
        .from("lesson_watch_progress")
        .select("completed")
        .eq("user_id", gate.userId)
        .eq("lesson_id", primaryLesson.id)
        .maybeSingle()
    : { data: null };

  const videoCompleted = watch?.completed === true;

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#f7f9fc,#fff)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href="/academy/lekari"
            className="text-xs uppercase tracking-[0.14em] text-[#005B96]"
          >
            ← Lékařská zóna
          </Link>
          <h1 className="mt-4 font-serif text-4xl tracking-tight text-[#021d33]">
            {course.title}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {course.partner?.name ?? "Partner"} · ČLK {course.accreditation_number} ·{" "}
            {course.credits_count} kreditů · práh {course.passing_threshold}%
          </p>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            {course.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-12 px-6 py-12">
        {course.modules.length > 0 ? (
          <section>
            <h2 className="font-serif text-2xl text-[#021d33]">Moduly</h2>
            <ol className="mt-4 space-y-3">
              {course.modules.map((mod, i) => (
                <li key={mod.id} className="border border-slate-200 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    Modul {i + 1}
                  </p>
                  <p className="mt-1 font-medium text-[#021d33]">{mod.title}</p>
                  {mod.description ? (
                    <p className="mt-1 text-sm text-slate-600">{mod.description}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {primaryLesson && videoUrl ? (
          <CmeLessonQuizSection
            lessonId={primaryLesson.id}
            lessonTitle={primaryLesson.title}
            videoUrl={videoUrl}
            poster={poster}
            quizId={quiz?.id ?? null}
            quizTitle={quiz?.title}
            initiallyUnlocked={videoCompleted}
          />
        ) : quiz ? (
          <section>
            <h2 className="font-serif text-2xl text-[#021d33]">{quiz.title}</h2>
            <div className="mt-4">
              <CmeQuizPlayer quizId={quiz.id} />
            </div>
          </section>
        ) : null}

        {primaryLesson?.article_body || primaryLesson?.content ? (
          <section>
            <h2 className="font-serif text-2xl text-[#021d33]">Studijní text</h2>
            <article className="prose prose-slate mt-4 max-w-none text-[15px] leading-relaxed">
              {(primaryLesson.article_body || primaryLesson.content)
                .split(/\n\n+/)
                .map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
            </article>
          </section>
        ) : null}
      </div>
    </main>
  );
}
