import Link from "next/link";
import { ArrowRight, BookOpen, Gauge, GraduationCap, Puzzle, Target, Timer } from "lucide-react";
import { PREP_FACULTIES, simulationTotals } from "@/lib/prep/faculties";
import { prepBankStats } from "@/lib/prep/questions";
import { PREP_CHAPTERS } from "@/lib/prep/curriculum";

const PILLARS = [
  {
    icon: Timer,
    title: "Simulace s odpočtem",
    body: "Bloky B/C/F podle vybrané fakulty, skóre a penalizace tam, kde dává smysl trénovat proti hádání.",
  },
  {
    icon: BookOpen,
    title: "Učení po kapitolách",
    body: "Krátký výklad, hned mini test s vysvětlením. Nejdřív pochopit, potom tempo.",
  },
  {
    icon: Target,
    title: "Drill slabých míst",
    body: "Po každém testu vidíte témata pod 70 %. Další sada jde přesně tam.",
  },
  {
    icon: Gauge,
    title: "Týdenní plán",
    body: "Sedm konkrétních kroků — kapitola, drill, simulace, pexeso. Bez rozhodovací únavy.",
  },
  {
    icon: Puzzle,
    title: "Pexeso a rychlý kvíz",
    body: "Názvosloví a vztahy, které se biflováním neudrží. Nízká zátěž, vysoké opakování.",
  },
  {
    icon: GraduationCap,
    title: "Osm českých LF",
    body: "1. LF, 2. LF, 3. LF, LFHK, LFP, MUNI, UPOL, LF OU — tréninkový formát, ne oficiální zadání.",
  },
] as const;

export function PrepLanding() {
  const stats = prepBankStats();
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6 sm:py-14">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C45C26]">
            MeDiprep · originální banka
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#1A2332] sm:text-5xl">
            Příprava na medicínu, která ukáže mezery dřív, než padnou na zkoušce.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#3d4a5c] sm:text-lg">
            Biologie, chemie a fyzika v testech nanečisto — s časem, skóre a vysvětlením. Vyberete fakultu,
            systém drží formát bloků. Otázky jsou vlastní, didakticky stavěné na gymnázium mířící na LF.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/app/priprava?tab=testy&mode=mini&subject=mixed&count=12"
              className="inline-flex items-center rounded-full bg-[#C45C26] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a84c1e]"
            >
              První test v aplikaci
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/mediprep/stahnout"
              className="inline-flex items-center rounded-full border border-[#1A2332]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#1A2332] hover:bg-[#efe6d6]"
            >
              Stáhnout MeDiprep
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#6b6256]">
            Bez karty. Progres se ukládá v prohlížeči. {stats.total} otázek · {PREP_CHAPTERS.length} kapitol ·{" "}
            {PREP_FACULTIES.length} fakult.
          </p>
        </div>
        <div className="rounded-[28px] border border-[#e0d5c4] bg-white p-6 shadow-[0_20px_50px_-28px_rgba(26,35,50,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F6B5A]">Jak to běží</p>
          <ol className="mt-4 space-y-4">
            {[
              "Vyberete fakultu — nastaví se bloky a bodování.",
              "Učíte se kapitolu, ne celou učebnici najednou.",
              "Simulace jednou týdně. Slabá témata jdou do drillu.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-[#3d4a5c]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A2332] text-xs font-semibold text-[#F8F4EA]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-2xl bg-[#F3EDE1] px-4 py-3 text-xs leading-relaxed text-[#5a5348]">
            Nejsme lékařská fakulta a otázky nejsou oficiální přijímačky. Jde o trénink na úrovni gymnázia s
            lékařským důrazem. Termíny vždy ověřte na webu fakulty.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Vyberte fakultu</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#5a5348]">
          Obsah je stejná banka B/C/F. Liší se délka bloků, tempo a to, jestli trénujeme i vícesprávné položky
          (MUNI) nebo mírnou penalizaci za chybu (UPOL).
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PREP_FACULTIES.map((f) => {
            const tot = simulationTotals(f);
            return (
              <Link
                key={f.slug}
                href={`/app/priprava?tab=testy&mode=simulation&faculty=${f.slug}`}
                className="group rounded-2xl border border-[#e0d5c4] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#C45C26]/40 hover:shadow-md"
              >
                <span className="inline-block h-1.5 w-8 rounded-full" style={{ background: f.accent }} />
                <p className="mt-3 font-display text-lg font-semibold group-hover:text-[#005B96]">{f.shortName}</p>
                <p className="text-xs text-[#6b6256]">{f.city}</p>
                <p className="mt-2 text-xs text-[#5a5348]">
                  {tot.questions} otázek · {tot.minutes} min
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Co MeDiprep umí</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.title} className="rounded-2xl border border-[#e0d5c4] bg-white p-5">
                <Icon className="h-5 w-5 text-[#C45C26]" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a5348]">{p.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
