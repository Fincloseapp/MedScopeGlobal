import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  GraduationCap,
  Sparkles,
  Target,
  Trophy,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/academy/course-card";
import { getCourseVideoFlags, listPublishedCourses } from "@/lib/academy/db";

const VALUE_POINTS = [
  {
    icon: Target,
    title: "Příprava na Cermat i vlastní testy LF",
    body: "Biologie, chemie, fyzika a strategie testu — obsah sladěný s reálnými přijímačkami.",
  },
  {
    icon: Brain,
    title: "AI lektor u videokurzů",
    body: "Vysvětlení látky, odpovědi na dotazy a procvičení typických úloh bez čekání na doučování.",
  },
  {
    icon: Unlock,
    title: "≈30 % kurzu zdarma",
    body: "První lekce každého kurzu si vyzkoušíte bez předplatného — včetně AI videa.",
  },
  {
    icon: Trophy,
    title: "XP, kvízy a rozhodovací strom LF",
    body: "Gamifikace motivuje k pravidelné přípravě. Bonus: jak vybrat mezi 8 českými LF.",
  },
];

export async function PrepValueProposition() {
  const prepCourses = await listPublishedCourses(6, { prepOnly: true });
  const flags = await getCourseVideoFlags(prepCourses.map((c) => c.id));

  return (
    <>
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.08),transparent_40%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            Pro uchazeče o LF
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">
            Chci studovat medicínu
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            MedScope Academy vás provede přípravou na přijímačky — od buněčné biologie po ústní
            pohovor. Začněte zdarma, pokračujte s studentským předplatným od 149 Kč/měsíc.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/academy/courses?category=prijimacky">
                Přípravné kurzy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#005B96]/30">
              <Link href="/studium/prijimacky">Termíny a požadavky LF</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUE_POINTS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.4)]"
            >
              <Icon className="h-6 w-6 text-[#005B96]" aria-hidden />
              <h2 className="mt-3 font-display text-lg font-semibold text-[#021d33]">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff] p-6">
          <div className="flex flex-wrap items-start gap-4">
            <Sparkles className="h-8 w-8 shrink-0 text-[#005B96]" aria-hidden />
            <div>
              <h2 className="font-display text-xl font-semibold text-[#021d33]">
                Proč MedScope místo generického doučování?
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• 12 přípravných kurzů včetně rozhodovacího stromu „Která LF?“</li>
                <li>• Videokurzy s AI lektorem — ne jen statické PDF</li>
                <li>• Kvízy s okamžitou zpětnou vazbou a vysvětlením odpovědí</li>
                <li>• Sledování postupu, XP body a certifikáty po dokončení</li>
              </ul>
            </div>
          </div>
        </div>

        {prepCourses.length > 0 ? (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                  MedScope Academy
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
                  Začněte přípravu hned
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  První lekce každého kurzu je zdarma — vyzkoušejte AI video bez registrace.
                </p>
              </div>
              <Link
                href="/academy/courses?category=prijimacky"
                className="inline-flex items-center text-sm font-medium text-[#005B96] hover:underline"
              >
                Všechny kurzy <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prepCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  hasVideo={flags[course.id]?.hasVideo}
                  videoLessonCount={flags[course.id]?.videoLessonCount}
                  showFreePreview
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <Link
            href="/studium/univerzity"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40"
          >
            <GraduationCap className="h-5 w-5 text-[#005B96]" />
            <span className="text-sm font-medium text-[#021d33]">Lékařské fakulty</span>
          </Link>
          <Link
            href="/studenti/testy"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40"
          >
            <BookOpen className="h-5 w-5 text-[#005B96]" />
            <span className="text-sm font-medium text-[#021d33]">Testy a kvízy</span>
          </Link>
          <Link
            href="/studenti/ai-tutor"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40"
          >
            <Brain className="h-5 w-5 text-[#005B96]" />
            <span className="text-sm font-medium text-[#021d33]">AI tutor</span>
          </Link>
        </section>
      </div>
    </>
  );
}
