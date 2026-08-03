import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, GraduationCap } from "lucide-react";
import { CourseCard } from "@/components/academy/course-card";
import { FacultyDeadlinesBoard } from "@/components/prijimacky/faculty-deadlines-board";
import { getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";

export const metadata: Metadata = {
  title: "Přijímačky na medicínu — termíny LF a příprava",
  description:
    "Termíny přihlášek na české lékařské fakulty, předměty B/C/F a přípravné kurzy MedScope Academy pro maturanty.",
};

export const revalidate = 120;

const TIPS = [
  "Přihlášku podejte včas — u většiny LF UK/MU je deadline konec února.",
  "Trénujte biologii, chemii a fyziku v mixed režimu (self-testy Academy).",
  "Ověřte zdravotní způsobilost a aktuální sylabus přímo na webu fakulty.",
];

export default async function PrijimackyPage() {
  const prepCourses = await listPublishedCourses(6, { prepOnly: true });
  const flags = await getCourseVideoFlags(prepCourses.map((c) => c.id));

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/studium" className="hover:text-foreground">
          Studium
        </Link>
        <span className="mx-2">/</span>
        <span>Přijímačky</span>
      </nav>

      <div className="rounded-3xl bg-[#021d33] px-6 py-8 text-white sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Pro zájemce o LF
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Přijímačky na medicínu</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
          Termíny přihlášek, okna zkoušek a přípravné kurzy — přehledně pro poslední ročník gymnázia.
          Orientační data vždy ověřte na oficiálním webu fakulty.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/academy/courses?category=prijimacky"
            className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33]"
          >
            Hub přípravných kurzů
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/academy/prijimacky/self-test?subject=mixed&count=15"
            className="inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium"
          >
            Spustit self-test
          </Link>
        </div>
      </div>

      <FacultyDeadlinesBoard compact />

      <section className="rounded-2xl border border-[#005B96]/20 bg-gradient-to-br from-[#005B96]/5 to-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              MedScope Academy
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
              Přípravné kurzy
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Biologie, chemie, fyzika, testové strategie a pohovor — včetně self-testů z banky otázek.
            </p>
          </div>
          <GraduationCap className="hidden h-12 w-12 text-[#005B96]/40 sm:block" />
        </div>

        {prepCourses.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prepCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                hasVideo={flags[course.id]?.hasVideo}
                videoLessonCount={flags[course.id]?.videoLessonCount}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-6">
          <Link
            href="/academy/courses?category=prijimacky"
            className="inline-flex items-center rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#004a7a]"
          >
            Všechny přípravné kurzy
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <ul className="space-y-3 rounded-2xl border bg-white p-6">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm text-slate-700">
            <span className="text-primary">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
