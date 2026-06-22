import Link from "next/link";
import { ArrowRight, BookOpen, Brain, GraduationCap, Trophy, Unlock, Video } from "lucide-react";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { CourseCard } from "@/components/academy/course-card";
import { FreePreviewBanner } from "@/components/academy/free-preview-banner";
import { getCourseVideoFlags, countPrepCourses, listPublishedCourses } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyHubPage() {
  const [courses, prepCourses, prepTotal] = await Promise.all([
    listPublishedCourses(6),
    listPublishedCourses(4, { prepOnly: true }),
    countPrepCourses(),
  ]);
  const allIds = [...courses, ...prepCourses].map((c) => c.id);
  const flags = await getCourseVideoFlags(allIds);

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy"
        title="Vzdělávání pro budoucí i praktikující lékaře"
        description="Videokurzy s AI lektorem, kvízy a gamifikace. Uchazeči o LF: ≈30 % každého kurzu zdarma — včetně první video lekce."
        ctaHref="/academy/courses?category=prijimacky"
        ctaLabel="Příprava na přijímačky"
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <FreePreviewBanner totalLessons={3} className="mb-8" />

        {prepCourses.length > 0 ? (
          <section className="mb-10 rounded-2xl border border-[#cfe1f3] bg-gradient-to-br from-[#f0f7ff] to-white p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                  Pro uchazeče o LF
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
                  Příprava na přijímačky
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Biologie, chemie, fyzika, strategie testu a rozhodovací strom výběru fakulty.
                </p>
              </div>
              <Link
                href="/studenti/chci-studovat"
                className="inline-flex items-center text-sm font-medium text-[#005B96] hover:underline"
              >
                Chci studovat medicínu <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {prepCourses.slice(0, 4).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  hasVideo={flags[course.id]?.hasVideo}
                  videoLessonCount={flags[course.id]?.videoLessonCount}
                  showFreePreview
                />
              ))}
            </div>
            <Link
              href="/academy/courses?category=prijimacky"
              className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96] hover:underline"
            >
              Všechny přípravné kurzy ({prepTotal}) <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </section>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <BookOpen className="h-8 w-8 text-[#005B96]" aria-hidden />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">Kurzy a lekce</h2>
            <p className="mt-2 text-sm text-slate-600">Strukturovaný obsah od anatomie po klinickou praxi.</p>
          </div>
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <Video className="h-8 w-8 text-[#005B96]" aria-hidden />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">Videokurzy + AI lektor</h2>
            <p className="mt-2 text-sm text-slate-600">Video lekce s evropským AI tutorem na každé stránce kurzu.</p>
          </div>
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <Unlock className="h-8 w-8 text-[#005B96]" aria-hidden />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">Náhled zdarma</h2>
            <p className="mt-2 text-sm text-slate-600">≈30 % lekcí každého kurzu bez předplatného — včetně AI videa.</p>
          </div>
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <Trophy className="h-8 w-8 text-[#005B96]" aria-hidden />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">XP a žebříček</h2>
            <p className="mt-2 text-sm text-slate-600">Body za lekce a kvízy, certifikáty a leaderboard.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/academy/courses" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Kurzy
          </Link>
          <Link href="/academy/courses?category=prijimacky" className="inline-flex items-center gap-1 rounded-full border border-[#005B96]/30 bg-[#f0f7ff] px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#e8f4fc]">
            <GraduationCap className="h-3.5 w-3.5" />
            Přijímačky LF
          </Link>
          <Link href="/academy/mentoring" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            AI lektor
          </Link>
          <Link href="/academy/quizzes" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Kvízy
          </Link>
          <Link href="/academy/ai-simulations" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Simulace
          </Link>
          <Link href="/academy/leaderboard" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Žebříček
          </Link>
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                Dostupné kurzy
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">Nejnovější kurzy</h2>
            </div>
            <Link
              href="/academy/courses"
              className="inline-flex items-center text-sm font-medium text-[#005B96] hover:underline"
            >
              Všechny kurzy <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  hasVideo={flags[course.id]?.hasVideo}
                  videoLessonCount={flags[course.id]?.videoLessonCount}
                  showFreePreview
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              <p>Zatím nejsou publikované žádné kurzy.</p>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#021d33] p-6 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <Brain className="h-10 w-10 shrink-0 text-[#7CC4FF]" aria-hidden />
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">Student medicíny nebo uchazeč o LF?</h2>
              <p className="mt-1 text-sm text-slate-300">
                Projít přípravnou cestu, získat XP a vyzkoušet AI tutora — začněte na stránce pro uchazeče.
              </p>
            </div>
            <Link
              href="/studenti/chci-studovat"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-slate-100"
            >
              Chci studovat medicínu
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
