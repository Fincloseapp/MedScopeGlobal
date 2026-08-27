import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  Sparkles,
  Unlock,
} from "lucide-react";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { FreePreviewBanner } from "@/components/academy/free-preview-banner";
import { Button } from "@/components/ui/button";
import {
  getCourseBySlug,
  listPublishedQuizzesByCourseId,
} from "@/lib/academy/db";
import {
  formatFreePreviewLabel,
  getFreePreviewLessonCount,
  isLessonFreePreview,
} from "@/lib/academy/preview";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { TtsListenButton } from "@/components/tts/tts-listen-button";
import { prepareArticleForSpeech } from "@/lib/tts/prepare-for-speech";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

function lessonExcerpt(content: string | null | undefined, max = 140): string {
  if (!content) return "";
  const plain = content
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) {
    return await buildLocalizedV20PageMetadata({
      title: "Kurz nenalezen",
      description: "Požadovaný kurz v MedScope Academy nebyl nalezen.",
      path: `/academy/courses/${slug}`,
    });
  }
  return await buildLocalizedV20PageMetadata({
    title: `${course.title} — MedScope Academy`,
    description: course.summary ?? course.description,
    path: `/academy/courses/${slug}`,
  });
}

export default async function AcademyCourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const quizzes = await listPublishedQuizzesByCourseId(course.id);
  const isPrep = course.category === "prijimacky" || course.level === "priprava";
  const freeCount = getFreePreviewLessonCount(course.lessons.length);
  const firstLesson = course.lessons[0] ?? null;
  const firstLessonHref = firstLesson
    ? `/academy/courses/${slug}/lessons/${firstLesson.slug}`
    : null;

  const totalMinutes =
    course.duration_minutes > 0
      ? course.duration_minutes
      : course.lessons.reduce((sum, l) => sum + (l.duration_minutes || 5), 0);

  const fullCourseListenText = prepareArticleForSpeech(
    {
      title: course.title,
      excerpt: course.summary ?? course.description,
      content: course.lessons
        .map((l) => `${l.title}. ${l.content?.slice(0, 500) ?? ""}`)
        .join("\n\n"),
    },
    { withBroadcastIntro: false, withClosing: false }
  );

  return (
    <>
      <AcademyPageHeader
        eyebrow={isPrep ? "Příprava na přijímačky" : "Kurz MedScope Academy"}
        title={course.title}
        description={`${course.summary ?? course.description}${totalMinutes ? ` · ≈ ${totalMinutes} min` : ""}${course.xp_reward > 0 ? ` · +${course.xp_reward} XP` : ""}`}
        ctaHref={firstLessonHref ?? "/predplatne"}
        ctaLabel={firstLessonHref ? "Začít 1. lekci zdarma" : "Studentské předplatné"}
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
          {isPrep ? (
            <>
              <span className="mx-2">/</span>
              <Link
                href="/academy/courses?category=prijimacky"
                className="hover:text-foreground"
              >
                Přijímačky
              </Link>
            </>
          ) : null}
          <span className="mx-2">/</span>
          <span>{course.title}</span>
        </nav>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(course.video_lesson_count ?? 0) > 0 ? (
                <p className="inline-flex items-center gap-1 rounded-full bg-[#e8f4fc] px-3 py-1 text-xs font-medium text-[#005B96]">
                  <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                  Videokurz · {course.video_lesson_count} video lekcí
                </p>
              ) : null}
              {course.xp_reward > 0 ? (
                <p className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  +{course.xp_reward} XP po dokončení
                </p>
              ) : null}
              {isPrep ? (
                <p className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Úroveň přijímaček LF
                </p>
              ) : null}
            </div>

            <FreePreviewBanner totalLessons={course.lessons.length} />

            {(course.summary ?? course.description) ? (
              <div>
                <TtsListenButton
                  text={fullCourseListenText}
                  label="Poslech celého kurzu"
                  lang="cs-CZ"
                />
              </div>
            ) : null}

            <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
              <h2 className="font-display text-lg font-semibold text-[#021d33]">
                Co v kurzu zvládnete
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  Srozumitelný výklad klíčových pojmů — ne jen hesla, ale souvislosti pro test.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  {formatFreePreviewLabel(course.lessons.length)} bez předplatného, včetně AI lektora.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  {quizzes.length > 0
                    ? "Procvičení kvízem s okamžitou zpětnou vazbou a vysvětlením odpovědí."
                    : "Strukturované lekce připravené na další procvičení a školní testy."}
                </li>
                {isPrep ? (
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                    Obsah laděný na přijímačky LF — od gymnázia k medicíně, bez zbytečné vaty.
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-[#005B96]/25 bg-[#f0f7ff] p-5 shadow-[0_16px_40px_-28px_rgba(0,91,150,0.55)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005B96]">
                Začněte hned
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                První lekce je zdarma. Ověřte si styl výkladu — pak pokračujte předplatným a
                odemknete celý kurz i další přípravné kurzy.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {firstLessonHref ? (
                  <Button asChild className="rounded-full bg-[#005B96]">
                    <Link href={firstLessonHref}>
                      Začít 1. lekci zdarma
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="rounded-full border-[#005B96]/35">
                  <Link href="/predplatne">Studentské předplatné od 149 Kč</Link>
                </Button>
                {isPrep ? (
                  <Link
                    href="/academy/prijimacky/self-test"
                    className="text-center text-xs font-medium text-[#005B96] underline-offset-2 hover:underline"
                  >
                    Rychlý self-test přijímaček →
                  </Link>
                ) : null}
              </div>
            </div>

            {quizzes.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#021d33]">
                  <ClipboardList className="h-4 w-4 text-[#005B96]" aria-hidden />
                  Kvízy kurzu
                </p>
                <ul className="mt-3 space-y-2">
                  {quizzes.map((quiz) => (
                    <li key={quiz.id}>
                      <Link
                        href={`/academy/quizzes/${quiz.id}`}
                        className="block rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-[#005B96]/40 hover:bg-[#f8fbff]"
                      >
                        <span className="font-medium text-[#021d33]">{quiz.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Minimální skóre {quiz.passing_score} %
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        {totalMinutes > 0 ? (
          <p className="mb-4 text-sm text-slate-600">
            <BookOpen className="mr-1 inline h-4 w-4 text-[#005B96]" aria-hidden />
            ≈ <strong>{totalMinutes} min</strong> · {course.lessons.length} lekcí ·{" "}
            {freeCount} zdarma
          </p>
        ) : null}

        <h2 className="mb-3 font-display text-xl font-semibold text-[#021d33]">Lekce kurzu</h2>

        {course.lessons.length > 0 ? (
          <div className="grid gap-3">
            {course.lessons.map((lesson, i) => {
              const isFree = isLessonFreePreview(i, course.lessons.length);
              const excerpt = lessonExcerpt(lesson.content);
              return (
                <Link
                  key={lesson.id}
                  href={`/academy/courses/${slug}/lessons/${lesson.slug}`}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#005B96]/40 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">Lekce {i + 1}</p>
                      <p className="font-medium text-[#021d33]">{lesson.title}</p>
                      {excerpt ? (
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{excerpt}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {lesson.video_asset_id ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#005B96]">
                            <PlayCircle className="h-3 w-3" aria-hidden />
                            Video + AI lektor
                          </span>
                        ) : null}
                        {isFree ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <Unlock className="h-3 w-3" aria-hidden />
                            Zdarma — začněte sem
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">V předplatném</span>
                        )}
                      </div>
                    </div>
                    {lesson.duration_minutes > 0 ? (
                      <span className="shrink-0 text-xs text-slate-500">
                        {lesson.duration_minutes} min
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            Tento kurz zatím nemá publikované lekce.
          </p>
        )}

        <div className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[linear-gradient(135deg,#f8fbff_0%,#eef6fc_100%)] p-6">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">
            Pokračujte předplatným a doporučte kamarádům
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700">
            Po první lekci máte jasno, jestli vám styl sedí. Studentské předplatné odemyká všechny
            přípravné kurzy, kvízy a materiály — ideální příprava na přijímačky i školní testy.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/predplatne">
                Odemknout předplatné
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/academy/courses?category=prijimacky">Další přípravné kurzy</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
