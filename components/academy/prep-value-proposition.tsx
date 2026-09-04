import { StudentLink as Link } from "@/components/studenti/student-link";
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
import { CourseCard } from "@/components/academy/course-card";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
import { isAcademyCoursesCatalogPromoEnabled } from "@/lib/academy/public-catalog";
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
  const promo = isAcademyCoursesCatalogPromoEnabled();
  const prepCourses = promo ? await listPublishedCourses(6, { prepOnly: true }) : [];
  const flags = promo ? await getCourseVideoFlags(prepCourses.map((c) => c.id)) : {};

  const lead = promo
    ? "MedScope Academy vás provede přípravou na přijímačky — od buněčné biologie po ústní pohovor. 1 test zdarma, první měsíc 89 Kč, další 149 Kč."
    : "Připravte se na přijímačky v MeDiprep. Katalog Academy kurzů připravujeme — nechceme vás posílat do polovičatého obsahu.";

  return (
    <StudentAtelierShell
      current="/studenti/chci-studovat"
      kicker="Ateliér · Uchazeči"
      title="Chci studovat medicínu"
      lead={lead}
      actions={
        <>
          <Link
            href={promo ? "/academy/courses?category=prijimacky" : "/app/priprava"}
            className={atelierPrimaryLink()}
          >
            {promo ? "Přípravné kurzy" : "Otevřít MeDiprep"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/academy/prijimacky/self-test" className={atelierGhostLink()}>
            Self-test přijímaček
          </Link>
          <Link href="/studium/prijimacky" className={atelierGhostLink()}>
            Termíny a požadavky LF
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {VALUE_POINTS.map(({ icon: Icon, title, body: point }) => (
          <article
            key={title}
            className="rounded-2xl border border-[#1b1712]/12 bg-white/80 p-5"
          >
            <Icon className="h-6 w-6 text-[#8a6d32]" aria-hidden />
            <h2 className="mt-3 font-display text-lg font-semibold text-[#1b1712]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c564c]">{point}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-[#1b1712]/12 bg-[#f6f1e8] p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Sparkles className="h-8 w-8 shrink-0 text-[#8a6d32]" aria-hidden />
          <div>
            <h2 className="font-display text-xl font-semibold text-[#1b1712]">
              Proč MedScope místo generického doučování?
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[#1b1712]/80">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">
                MedScope Academy
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#1b1712]">
                Začněte přípravu hned
              </h2>
              <p className="mt-1 text-sm text-[#5c564c]">
                První lekce každého kurzu je zdarma — vyzkoušejte AI video bez registrace.
              </p>
            </div>
            <Link
              href="/academy/courses?category=prijimacky"
              className="inline-flex items-center text-sm font-medium text-[#8a6d32] hover:underline"
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

      <section className="mt-12 border-t border-[#1b1712]/10 pt-8">
        <h2 className="font-display text-xl font-semibold text-[#1b1712]">
          Pro rodiče a uchazeče: kdy má smysl předplatné
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c564c]">
          Free lekce a self-test stačí na rozhodnutí. Studentské předplatné (89 Kč první měsíc, pak
          149 Kč) dává smysl, když chcete pravidelnou přípravu — celou Academy, AI tutor a opakované
          kvízy. Nezaručuje přijetí; zvyšuje šanci strukturovaným tréninkem.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/predplatne#student" className={atelierPrimaryLink()}>
            89 Kč první měsíc — Student LF
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/studenti#pro-rodice" className={atelierGhostLink()}>
            Informace pro rodiče
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <Link
          href="/studium/univerzity"
          className="flex items-center gap-3 rounded-xl border border-[#1b1712]/12 bg-white/80 p-4 transition hover:border-[#8a6d32]/50"
        >
          <GraduationCap className="h-5 w-5 text-[#8a6d32]" />
          <span className="text-sm font-medium text-[#1b1712]">Lékařské fakulty</span>
        </Link>
        <Link
          href="/studenti/testy"
          className="flex items-center gap-3 rounded-xl border border-[#1b1712]/12 bg-white/80 p-4 transition hover:border-[#8a6d32]/50"
        >
          <BookOpen className="h-5 w-5 text-[#8a6d32]" />
          <span className="text-sm font-medium text-[#1b1712]">Testy a kvízy</span>
        </Link>
        <Link
          href="/studenti/ai-tutor"
          className="flex items-center gap-3 rounded-xl border border-[#1b1712]/12 bg-white/80 p-4 transition hover:border-[#8a6d32]/50"
        >
          <Brain className="h-5 w-5 text-[#8a6d32]" />
          <span className="text-sm font-medium text-[#1b1712]">AI tutor</span>
        </Link>
      </section>
    </StudentAtelierShell>
  );
}
