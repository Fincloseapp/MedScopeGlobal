import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle, Sparkles, Unlock } from "lucide-react";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { FreePreviewBanner } from "@/components/academy/free-preview-banner";
import { getCourseBySlug } from "@/lib/academy/db";
import { isLessonFreePreview } from "@/lib/academy/preview";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { TtsListenButton } from "@/components/tts/tts-listen-button";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) {
    return buildV20PageMetadata({
      title: "Kurz nenalezen",
      description: "Požadovaný kurz v MedScope Academy nebyl nalezen.",
      path: `/academy/courses/${slug}`,
    });
  }
  return buildV20PageMetadata({
    title: `${course.title} — MedScope Academy`,
    description: course.summary ?? course.description,
    path: `/academy/courses/${slug}`,
  });
}

export default async function AcademyCourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const totalMinutes =
    course.duration_minutes > 0
      ? course.duration_minutes
      : course.lessons.reduce((sum, l) => sum + (l.duration_minutes || 5), 0);

  const fullCourseListenText = [
    course.title,
    course.summary ?? course.description,
    ...course.lessons.map((l) => `${l.title}. ${l.content?.slice(0, 500) ?? ""}`),
  ].join("\n\n");

  return (
    <>
      <AcademyPageHeader
        eyebrow="Kurz"
        title={course.title}
        description={`${course.summary ?? course.description}${totalMinutes ? ` · ≈ ${totalMinutes} min` : ""}${course.xp_reward > 0 ? ` · +${course.xp_reward} XP` : ""}`}
        ctaHref="/academy/courses"
        ctaLabel="Zpět na kurzy"
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/academy" className="hover:text-foreground">
            Academy
          </Link>
          <span className="mx-2">/</span>
          <Link href="/academy/courses" className="hover:text-foreground">
            Kurzy
          </Link>
          <span className="mx-2">/</span>
          <span>{course.title}</span>
        </nav>

        {(course.video_lesson_count ?? 0) > 0 ? (
          <p className="mb-4 inline-flex items-center gap-1 rounded-full bg-[#e8f4fc] px-3 py-1 text-xs font-medium text-[#005B96]">
            <PlayCircle className="h-3.5 w-3.5" aria-hidden />
            Videokurz · {course.video_lesson_count} video lekcí
          </p>
        ) : null}

        {course.xp_reward > 0 ? (
          <p className="mb-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            +{course.xp_reward} XP po dokončení kurzu
          </p>
        ) : null}

        <FreePreviewBanner totalLessons={course.lessons.length} className="mb-6" />

        {(course.summary ?? course.description) ? (
          <div className="mb-6">
            <TtsListenButton text={fullCourseListenText} label="Poslech celého kurzu" />
          </div>
        ) : null}

        {totalMinutes > 0 ? (
          <p className="mb-4 text-sm text-slate-600">
            ≈ <strong>{totalMinutes} min poslechu</strong> ({course.lessons.length} lekcí)
          </p>
        ) : null}

        {course.lessons.length > 0 ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
              <span>Průběh kurzu</span>
              <span>
                0 / {course.lessons.length} lekcí
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-0 rounded-full bg-[#005B96] transition-all" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Přihlaste se pro sledování postupu a získávání XP.
            </p>
          </div>
        ) : null}

        {course.lessons.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {course.lessons.map((lesson, i) => {
              const isFree = isLessonFreePreview(i, course.lessons.length);
              return (
              <div key={lesson.id}>
                <Link
                  href={`/academy/courses/${slug}/lessons/${lesson.slug}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-[#005B96]/40 hover:shadow-sm"
                >
                  <div>
                    <p className="text-xs text-slate-500">Lekce {i + 1}</p>
                    <p className="font-medium text-[#021d33]">{lesson.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {lesson.video_asset_id ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#005B96]">
                          <PlayCircle className="h-3 w-3" aria-hidden />
                          Video + AI lektor
                        </span>
                      ) : null}
                      {isFree ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <Unlock className="h-3 w-3" aria-hidden />
                          Zdarma
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {lesson.duration_minutes > 0 ? (
                    <span className="text-xs text-slate-500">{lesson.duration_minutes} min</span>
                  ) : null}
                </Link>
              </div>
            );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            Tento kurz zatím nemá publikované lekce.
          </p>
        )}
      </div>
    </>
  );
}
