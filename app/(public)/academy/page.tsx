import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Trophy, Video } from "lucide-react";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { CourseCard } from "@/components/academy/course-card";
import { getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyHubPage() {
  const courses = await listPublishedCourses(6);
  const flags = await getCourseVideoFlags(courses.map((c) => c.id));

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy v35"
        title="Vzdělávání pro budoucí i praktikující lékaře"
        description="Videokurzy s AI lektorem, kvízy a gamifikace integrované do MedScopeGlobal."
        ctaHref="/academy/courses"
        ctaLabel="Prohlédnout kurzy"
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <BookOpen className="h-8 w-8 text-[#005B96]" />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">Kurzy a lekce</h2>
            <p className="mt-2 text-sm text-slate-600">Strukturovaný obsah od anatomie po klinickou praxi.</p>
          </div>
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <Video className="h-8 w-8 text-[#005B96]" />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">Videokurzy + AI lektor</h2>
            <p className="mt-2 text-sm text-slate-600">Video lekce s evropským AI tutorem na každé stránce kurzu.</p>
          </div>
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <Brain className="h-8 w-8 text-[#005B96]" />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">Kvízy a testy</h2>
            <p className="mt-2 text-sm text-slate-600">Ověření znalostí s okamžitou zpětnou vazbou.</p>
          </div>
          <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <Trophy className="h-8 w-8 text-[#005B96]" />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">XP a žebříček</h2>
            <p className="mt-2 text-sm text-slate-600">Motivace studiem — body, certifikáty, leaderboard.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/academy/courses" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Kurzy
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
          <Link href="/academy/marketplace" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Marketplace
          </Link>
          <Link href="/academy/leaderboard" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Žebříček
          </Link>
          <Link href="/academy/certificates" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Certifikáty
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
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              <p>Zatím nejsou publikované žádné kurzy.</p>
              <p className="mt-2 text-xs">První kurzy přidá administrátor nebo AI pipeline ve fázi 2.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
