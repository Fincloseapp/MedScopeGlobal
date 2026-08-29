import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Trophy, Unlock, Video } from "lucide-react";
import { AccreditedCmeOverview } from "@/components/academy/b2b/accredited-cme-overview";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { CourseCard } from "@/components/academy/course-card";
import { FreePreviewBanner } from "@/components/academy/free-preview-banner";
import { isAcademyCoursesCatalogPromoEnabled } from "@/lib/academy/public-catalog";
import { getCourseVideoFlags, countPrepCourses, listPublishedCourses } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyHubPage() {
  const promo = isAcademyCoursesCatalogPromoEnabled();
  const [courses, prepCourses, prepTotal] = promo
    ? await Promise.all([
        listPublishedCourses(6),
        listPublishedCourses(4, { prepOnly: true }),
        countPrepCourses(),
      ])
    : [[], [], 0] as const;
  const allIds = [...courses, ...prepCourses].map((c) => c.id);
  const flags = promo ? await getCourseVideoFlags(allIds) : {};

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy"
        title="Vzdělávání pro budoucí i praktikující lékaře"
        description={
          promo
            ? "Videokurzy s AI lektorem, kvízy a gamifikace. Uchazeči o LF: ≈30 % každého kurzu zdarma — včetně první video lekce."
            : "Academy zůstává součástí MedScopeGlobal. Katalog kurzů připravujeme — zatím nabízíme CME zónu, magazín a aplikace."
        }
        ctaHref={promo ? "/academy/courses?category=prijimacky" : "/articles"}
        ctaLabel={promo ? "Příprava na přijímačky" : "Číst magazín"}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {promo ? <FreePreviewBanner totalLessons={3} className="mb-8" /> : null}

        {!promo ? (
          <section className="mb-10 border border-[#d9e8f4] bg-[#f8fbff] px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              Připravujeme
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-[#021d33]">
              Veřejný katalog kurzů zatím nezveřejňujeme naplno
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Nechceme lákat na polovičatý obsah. Až budou kurzy redakčně připravené, znovu je
              zviditelníme na homepage i v navigaci.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/app/priprava" className="font-medium text-[#005B96] hover:underline">
                MeDiprep — přijímačky
              </Link>
              <Link href="/academy/lekari" className="text-slate-600 hover:underline">
                CME revmatologie
              </Link>
              <Link href="/articles" className="text-slate-600 hover:underline">
                VitaScope magazín
              </Link>
            </div>
          </section>
        ) : null}

        <div className="mb-10">
          <AccreditedCmeOverview variant="panel" />
        </div>

        {promo && prepCourses.length > 0 ? (
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
            <p className="mt-2 text-sm text-slate-600">
              {promo
                ? "Strukturovaný obsah od anatomie po klinickou praxi."
                : "Katalog připravujeme — zatím sledujte redakci a CME."}
            </p>
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
          {promo ? (
            <>
              <Link href="/academy/courses" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
                Kurzy
              </Link>
              <Link href="/academy/courses?category=prijimacky" className="rounded-full border border-[#005B96]/30 bg-[#f0f7ff] px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#e8f4fc]">
                Přijímačky LF
              </Link>
            </>
          ) : null}
          <Link href="/academy/lekari" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            CME
          </Link>
          <Link href="/academy/quizzes" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Kvízy
          </Link>
          <Link href="/articles" className="rounded-full border border-[#cfe1f3] px-4 py-2 text-sm text-[#005B96] hover:bg-[#f0f7fc]">
            Magazín
          </Link>
        </div>

        {promo ? (
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
        ) : null}

        <section className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#021d33] p-6 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <Brain className="h-10 w-10 shrink-0 text-[#7CC4FF]" aria-hidden />
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">Student medicíny nebo uchazeč o LF?</h2>
              <p className="mt-1 text-sm text-slate-300">
                Začněte v MeDiprep nebo na studentské mapě — Academy katalog doplníme, až bude připravený.
              </p>
            </div>
            <Link
              href="/app/priprava"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-slate-100"
            >
              Otevřít MeDiprep
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
