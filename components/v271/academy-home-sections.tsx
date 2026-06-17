import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ShoppingBag, Stethoscope, Trophy, Users } from "lucide-react";
import { CourseCard } from "@/components/academy/course-card";
import {
  getCourseVideoFlags,
  getLeaderboard,
  listClinicalSimulations,
  listMarketplaceListings,
  listPublishedCourses,
  listTextbooks,
} from "@/lib/academy/db";

export async function V272AcademyHomeSections() {
  const [courses, prepCourses, simulations, textbooks, listings, leaderboard] = await Promise.all([
    listPublishedCourses(3),
    listPublishedCourses(6, { prepOnly: true }),
    listClinicalSimulations(2),
    listTextbooks(2),
    listMarketplaceListings(2),
    getLeaderboard("all_time", 5),
  ]);
  const flags = await getCourseVideoFlags(courses.map((c) => c.id));
  const prepFlags = await getCourseVideoFlags(prepCourses.map((c) => c.id));

  return (
    <>
      {prepCourses.length > 0 ? (
        <section className="border-b border-slate-200 bg-[#f0f7ff]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                  MedScope Academy
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
                  Příprava na přijímačky LF
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Kurzy pro zájemce o studium medicíny — biologie, chemie, fyzika, strategie testu a pohovor.
                </p>
              </div>
              <Link
                href="/academy/courses?category=prijimacky"
                className="text-sm font-medium text-[#005B96] hover:underline"
              >
                Všechny přípravné kurzy →
              </Link>
            </div>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
              {prepCourses.map((course) => (
                <div key={course.id} className="min-w-[280px] max-w-[320px] shrink-0 snap-start">
                  <CourseCard
                    course={course}
                    hasVideo={prepFlags[course.id]?.hasVideo}
                    videoLessonCount={prepFlags[course.id]?.videoLessonCount}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {courses.length > 0 ? (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                  MedScope Academy
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">Videokurzy s AI lektorem</h2>
              </div>
              <Link href="/academy/courses" className="text-sm font-medium text-[#005B96] hover:underline">
                Všechny kurzy →
              </Link>
            </div>
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
          </div>
        </section>
      ) : null}

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 text-[#005B96]">
                <Stethoscope className="h-5 w-5" />
                <h3 className="font-display text-lg font-semibold text-[#021d33]">AI simulace</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">Klinické scénáře a triážové případy.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {simulations.length > 0 ? (
                  simulations.map((s) => (
                    <li key={s.id}>
                      <Link href={`/academy/ai-simulations/${s.slug}`} className="text-[#005B96] hover:underline">
                        {s.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Simulace se generují…</li>
                )}
              </ul>
              <Link href="/academy/ai-simulations" className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96]">
                Všechny simulace <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 text-[#005B96]">
                <Users className="h-5 w-5" />
                <h3 className="font-display text-lg font-semibold text-[#021d33]">Mentoring</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                AI tutor a lidský mentor pro přípravu na LF i klinickou praxi.
              </p>
              <Link
                href="/academy/mentoring"
                className="mt-4 inline-flex rounded-full bg-[#005B96] px-4 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
              >
                Rezervovat mentoring
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 p-5">
              <ShoppingBag className="h-6 w-6 text-[#005B96]" />
              <h3 className="mt-3 font-display font-semibold text-[#021d33]">Marketplace</h3>
              <p className="mt-2 text-sm text-slate-600">Premium kurzy od partnerů.</p>
              {listings.length > 0 ? (
                <p className="mt-2 text-sm font-medium text-[#005B96]">Od {listings[0].price_czk} Kč</p>
              ) : null}
              <Link href="/academy/marketplace" className="mt-3 inline-block text-sm text-[#005B96] hover:underline">
                Tržiště →
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 p-5">
              <BookOpen className="h-6 w-6 text-[#005B96]" />
              <h3 className="mt-3 font-display font-semibold text-[#021d33]">Učebnice</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {textbooks.length > 0 ? (
                  textbooks.map((b) => (
                    <li key={b.id}>
                      <Link href={`/academy/textbooks/${b.slug}`} className="text-[#005B96] hover:underline">
                        {b.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Připravujeme…</li>
                )}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 p-5">
              <Trophy className="h-6 w-6 text-[#005B96]" />
              <h3 className="mt-3 font-display font-semibold text-[#021d33]">Žebříček XP</h3>
              {leaderboard.length > 0 ? (
                <ol className="mt-2 space-y-1 text-sm">
                  {leaderboard.slice(0, 3).map((e, i) => (
                    <li key={e.id} className="flex justify-between">
                      <span>#{i + 1}</span>
                      <span className="font-medium text-[#005B96]">{e.total_xp} XP</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Buďte první — získejte XP studiem.</p>
              )}
              <Link href="/academy/leaderboard" className="mt-3 inline-block text-sm text-[#005B96] hover:underline">
                Celý žebříček →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#005B96]/10 to-transparent px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-[#005B96]" />
            <div>
              <p className="font-display font-semibold text-[#021d33]">XP progress</p>
              <p className="text-sm text-slate-600">Sledujte postup, certifikáty a odměny.</p>
            </div>
          </div>
          <Link
            href="/academy/profile"
            className="rounded-full border border-[#005B96]/30 px-5 py-2 text-sm font-medium text-[#005B96] hover:bg-white"
          >
            Můj profil
          </Link>
        </div>
      </section>
    </>
  );
}
