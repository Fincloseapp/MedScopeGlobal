import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, Atom, Dna, Target, Sparkles } from "lucide-react";
import { FacultyDeadlinesBoard } from "@/components/prijimacky/faculty-deadlines-board";
import { bankStats } from "@/lib/prijimacky/question-bank";
import type { AcademyCourse } from "@/types/academy";
import { CourseCard } from "@/components/academy/course-card";

const TRACKS = [
  {
    id: "biologie",
    label: "Biologie",
    href: "/academy/prijimacky/self-test?subject=biologie",
    icon: Dna,
    blurb: "Buňka, genetika, fyziologie — základ přijímaček.",
  },
  {
    id: "chemie",
    label: "Chemie",
    href: "/academy/prijimacky/self-test?subject=chemie",
    icon: FlaskConical,
    blurb: "Obecná, organická a stechiometrie v testovém formátu.",
  },
  {
    id: "fyzika",
    label: "Fyzika",
    href: "/academy/prijimacky/self-test?subject=fyzika",
    icon: Atom,
    blurb: "Mechanika, elektřina, optika a termika.",
  },
  {
    id: "mixed",
    label: "Mixed B/C/F",
    href: "/academy/prijimacky/self-test?subject=mixed&count=20",
    icon: Target,
    blurb: "Simulace přijímaček — náhodný mix předmětů.",
  },
] as const;

function subjectFromCourse(course: AcademyCourse): string {
  const slug = course.slug ?? "";
  if (slug.includes("biologie") || slug.includes("anatomie") || slug.includes("fyziologie")) return "biologie";
  if (slug.includes("chemie")) return "chemie";
  if (slug.includes("fyzika")) return "fyzika";
  if (slug.includes("mixed") || slug.includes("opakovani")) return "mixed";
  return "strategie";
}

export function PrijimackyPrepHub({
  courses,
  flags,
}: {
  courses: AcademyCourse[];
  flags: Record<string, { hasVideo?: boolean; videoLessonCount?: number }>;
}) {
  const stats = bankStats();
  const byTrack: Record<string, AcademyCourse[]> = {
    biologie: [],
    chemie: [],
    fyzika: [],
    strategie: [],
    mixed: [],
  };
  for (const c of courses) {
    const key = subjectFromCourse(c);
    (byTrack[key] ?? byTrack.strategie).push(c);
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-[#cfe1f3] bg-[#021d33] px-6 py-10 text-white sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#005B96]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Pro maturanty gymnázií
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Příprava na přijímačky na lékařské fakulty v Česku
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
            Kurzy, self-testy a přehled termínů přihlášek — od biologie, chemie a fyziky až po strategii testu.
            Stavěné pro poslední ročník gymnázia, který míří na LF.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/academy/prijimacky/self-test?subject=mixed&count=15"
              className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-cyan-50"
            >
              Spustit self-test
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#kurzy"
              className="inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Prohlédnout kurzy
            </Link>
            <Link
              href="/studenti/chci-studovat"
              className="inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Chci studovat medicínu
            </Link>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Databáze otázek: {stats.total} (B {stats.bySubject.biologie ?? 0} · C{" "}
            {stats.bySubject.chemie ?? 0} · F {stats.bySubject.fyzika ?? 0}) — kvízy se generují automaticky
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#021d33]">Self-testy podle předmětu</h2>
            <p className="mt-1 text-sm text-slate-600">
              Otázky z banky faktů — náhodný výběr, okamžité vyhodnocení a vysvětlení.
            </p>
          </div>
          <BookOpen className="hidden h-8 w-8 text-[#005B96]/40 sm:block" aria-hidden />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.id}
                href={t.href}
                className="group rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm transition hover:border-[#005B96]/40 hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-[#005B96]" aria-hidden />
                <p className="mt-3 font-display text-lg font-semibold text-[#021d33] group-hover:text-[#005B96]">
                  {t.label}
                </p>
                <p className="mt-1 text-sm text-slate-600">{t.blurb}</p>
                <p className="mt-3 text-xs font-medium text-[#005B96]">Spustit →</p>
              </Link>
            );
          })}
        </div>
      </section>

      <FacultyDeadlinesBoard />

      <section id="kurzy">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Přípravné kurzy Academy</h2>
        <p className="mt-1 text-sm text-slate-600">
          Strukturované lekce + kvízy. Část obsahu je zdarma — ideální start před placeným balíčkem.
        </p>
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
          <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Přípravné kurzy se načítají — obnovte stránku za chvíli.
          </p>
        )}
      </section>
    </div>
  );
}
