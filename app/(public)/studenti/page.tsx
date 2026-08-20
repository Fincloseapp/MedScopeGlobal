import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

export const metadata: Metadata = {
  title: "MedScope pro studenty a uchazeče o medicínu",
  description:
    "Příprava na přijímačky na LF, studijní materiály a kvízy. Studentské předplatné od 149 Kč/měsíc — první lekce a trial zdarma.",
  alternates: { canonical: "/studenti" },
  openGraph: {
    title: "MedScope pro studenty a uchazeče o medicínu",
    description:
      "Jedna mapa: přijímačky, materiály, testy. Pro gymnazisty, studenty LF i rodiče — začněte zdarma.",
    url: "/studenti",
  },
};

const APPLICANT = [
  {
    href: "/studenti/chci-studovat",
    title: "Přípravné kurzy Academy",
    body: "Biologie, chemie, fyzika, fyziologie — lekce, slidy a kvízy. První lekce zdarma.",
  },
  {
    href: "/academy/prijimacky/self-test",
    title: "Self-test přijímaček",
    body: "Rychlý přehled silných a slabých míst — ideální první krok před kurzy.",
  },
  {
    href: "/studium/prijimacky",
    title: "Termíny a požadavky LF",
    body: "Přehled fakult a přijímacího řízení — ať víte, na co se připravovat.",
  },
] as const;

const ON_LF = [
  {
    href: "/studenti/materialy",
    title: "Studijní materiály",
    body: "Knihovna článků a podkladů podle témat — rychlá orientace během semestru.",
  },
  {
    href: "/studenti/testy",
    title: "Testy a procvičení",
    body: "Modelové otázky a procvičení — odděleně od studijních her.",
  },
  {
    href: "/studenti/ai-tutor",
    title: "AI tutor",
    body: "Dotazy k látce v kontextu studia — doplněk k materiálům, ne náhrada přednášek.",
  },
] as const;

const MORE = [
  {
    href: "/studenti/hry",
    title: "Kvízy a studijní hry",
    body: "Krátké hry na opakování — anatomie, fyziologie i přijímačky.",
  },
  {
    href: "/studenti/leky",
    title: "Léky (SÚKL)",
    body: "Vyhledávání léčiv — praktický rozcestník, ne farmakologický kurz.",
  },
  {
    href: "/studenti/zkousky",
    title: "Zkoušky a semestr",
    body: "Orientace ke zkouškovému období a opakování.",
  },
  {
    href: "/medicina/plany",
    title: "Studijní plány",
    body: "Strukturované cesty studiem napříč MedScope.",
  },
] as const;

const APPLICANT_STEPS = [
  {
    n: "1",
    title: "Self-test v MeDiprep (5–10 min)",
    body: "Zjistíte, kde jste a co dohnat — v aplikaci na ploše telefonu.",
    href: "/app/priprava",
    cta: "Otevřít MeDiprep",
    ctaAttr: "studenti-step-self-test",
  },
  {
    n: "2",
    title: "Jedna lekce zdarma",
    body: "Uvidíte styl videa, slidů a kvízů.",
    href: "/academy/courses?category=prijimacky",
    cta: "Otevřít kurzy",
    ctaAttr: "studenti-step-free-lesson",
  },
  {
    n: "3",
    title: `${VIP_TRIAL_DAYS} dní zdarma`,
    body: "Celá Academy + AI tutor bez závazku.",
    href: "/predplatne?trial=1#student",
    cta: "Vyzkoušet předplatné",
    ctaAttr: "studenti-step-trial",
  },
] as const;

const LF_STEPS = [
  {
    n: "1",
    title: "Materiály podle tématu",
    body: "Najděte podklad ke zkoušce nebo semináři.",
    href: "/studenti/materialy",
    cta: "Otevřít knihovnu",
  },
  {
    n: "2",
    title: "Procvičení",
    body: "Kvízy a testy — krátké opakování před testem.",
    href: "/studenti/testy",
    cta: "Spustit procvičení",
  },
  {
    n: "3",
    title: "AI tutor",
    body: "Doptat se na nejasnou látku, když není čas čekat.",
    href: "/studenti/ai-tutor",
    cta: "Otevřít AI tutor",
  },
] as const;

const SUB_BENEFITS = [
  "Všechny přípravné kurzy Academy (ne jen první lekce)",
  "AI tutor a studijní materiály bez omezení free vrstvy",
  "Kvízy, hry a procvičení — opakované použití během semestru",
  `${VIP_TRIAL_DAYS} dní zdarma, pak od 149 Kč/měsíc (Student LF)`,
] as const;

function StepCards({
  steps,
}: {
  steps: readonly {
    n: string;
    title: string;
    body: string;
    href: string;
    cta: string;
    ctaAttr?: string;
  }[];
}) {
  return (
    <ol className="mt-6 grid gap-4 sm:grid-cols-3">
      {steps.map((step) => (
        <li
          key={step.n}
          className="flex flex-col rounded-2xl border border-white bg-white/90 p-5 shadow-[0_12px_28px_-24px_rgba(0,91,150,0.45)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#005B96] text-sm font-bold text-white">
            {step.n}
          </span>
          <p className="mt-3 font-medium text-[#021d33]">{step.title}</p>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{step.body}</p>
          <Link
            href={step.href}
            data-cta={step.ctaAttr}
            className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96] hover:underline"
          >
            {step.cta}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function StudentiHubPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#d9e8f4]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(0,91,150,0.14),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(14,116,144,0.08),transparent_50%),linear-gradient(180deg,#f8fbff_0%,#ffffff_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23005B96' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="msg-hero-copy text-[11px] font-semibold uppercase tracking-[0.3em] text-[#005B96]">
            MedScope · Studenti
          </p>
          <h1 className="msg-hero-copy mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-[#021d33] sm:text-5xl">
            MedScope pro cestu na medicínu
            <span className="mt-1 block text-[0.85em] font-semibold text-[#005B96]">
              a studium na LF
            </span>
          </h1>
          <p className="msg-hero-copy mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Jedna přehledná mapa pro uchazeče, studenty LF i rodiče: přijímačky, materiály, testy.
            Začněte zdarma — bez bloudění a bez prázdných slibů.
          </p>
          <p className="msg-hero-copy mt-3 text-sm font-medium text-[#0a4a7a]/90">
            První lekce zdarma · {VIP_TRIAL_DAYS} dní trial · od 149 Kč/měsíc
          </p>
          <div className="msg-hero-cta mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96] px-6">
              <Link href="/app/priprava">
                Stáhnout MeDiprep
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#005B96]/35 px-6">
              <Link href="/studenti/chci-studovat">Chci na medicínu</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full text-[#005B96]">
              <Link href="#pro-rodice">Jsem rodič</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Drobečková navigace">
          <Link href="/" className="hover:text-foreground">
            Domů
          </Link>
          <span className="mx-2">/</span>
          <span>Studenti</span>
        </nav>

        <section className="msg-path mb-12 rounded-3xl border border-[#cfe1f3] bg-[#f0f7ff]/70 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            Doporučený start · uchazeči
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
            Tři kroky dnes — pak předplatné dává smysl
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Nejdřív ochutnejte obsah. Teprve když vidíte styl a zpětnou vazbu, má smysl otevřít celé
            studentské předplatné.
          </p>
          <StepCards steps={APPLICANT_STEPS} />
        </section>

        <p className="msg-path mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
          Vyberte si cestu
        </p>

        <div className="msg-path grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#cfe1f3] bg-white p-6 shadow-[0_20px_44px_-32px_rgba(0,91,150,0.5)]">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-7 w-7 shrink-0 text-[#005B96]" aria-hidden />
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#021d33]">
                  Chci na medicínu
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Uchazeč · gymnázium · příprava na přijímačky LF
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Sem patří přípravné kurzy Academy, self-test a termíny fakult. Není to „kompletní
              doučování na míru“ — je to strukturovaná příprava, kterou si hned vyzkoušíte.
            </p>
            <ul className="mt-5 space-y-2">
              {APPLICANT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#005B96]/45 hover:bg-[#f8fbff]"
                  >
                    <span>
                      <span className="block font-medium text-[#021d33] group-hover:text-[#005B96]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                        {item.body}
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-[#005B96] transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Button asChild className="rounded-full bg-[#005B96]">
                <Link href="/studenti/chci-studovat">
                  Otevřít přípravu na přijímačky
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          <section
            id="pro-studenty-lf"
            className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-7 w-7 shrink-0 text-[#005B96]" aria-hidden />
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#021d33]">
                  Už studuji na LF
                </h2>
                <p className="mt-1 text-sm text-slate-600">1.–6. ročník · materiály, testy, opakování</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Sem patří knihovna materiálů, kvízy a AI tutor. Cíl je rychlá orientace — ne další
              nepřehledný dashboard.
            </p>
            <ul className="mt-5 space-y-2">
              {ON_LF.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#005B96]/45 hover:bg-[#f8fbff]"
                  >
                    <span>
                      <span className="block font-medium text-[#021d33] group-hover:text-[#005B96]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                        {item.body}
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-[#005B96] transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild className="rounded-full bg-[#005B96]">
                <Link href="/studenti/materialy">
                  Otevřít studijní materiály
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/predplatne#student">Studentské předplatné</Link>
              </Button>
            </div>
          </section>
        </div>

        <section
          id="lf-start"
          className="msg-path mt-10 scroll-mt-24 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            Doporučený start · studenti LF
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
            Tři kroky během semestru
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Nejdřív najděte materiál, pak si látku procvičte. AI tutor je doplněk — ne náhrada
            přednášek ani skript z fakulty.
          </p>
          <StepCards steps={LF_STEPS} />
        </section>

        <section
          id="pro-rodice"
          className="mt-12 scroll-mt-24 rounded-3xl border border-[#cfe1f3] bg-white p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start gap-4">
            <HeartHandshake className="h-7 w-7 shrink-0 text-[#005B96]" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#005B96]">
                Pro rodiče
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
                Podpora přípravy — srozumitelně a bez přehánění
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">
                Předplatné Student LF (od 149 Kč/měsíc) otevírá celou Academy a AI tutor. Nezaručuje
                přijetí na medicínu — zvyšuje ale šanci tím, že dítě má strukturovanou přípravu,
                kvízy a zpětnou vazbu místo nahodilého scrollování. Začněte trialem: uvidíte, jestli
                to dítě skutečně používá.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  "První lekce kurzů zdarma — bez karty",
                  `${VIP_TRIAL_DAYS} dní plného přístupu zdarma`,
                  "Cena srovnatelná s jedním doučováním",
                  "Obsah v češtině, zaměřený na LF přijímačky",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-[#005B96]">
                  <Link href="/predplatne?trial=1#student" data-cta="studenti-parent-trial">
                    Darovat / vyzkoušet {VIP_TRIAL_DAYS} dní
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/studenti/chci-studovat" data-cta="studenti-parent-prep">
                    Ukázat dítěti přípravu
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-3xl border border-[#005B96]/25 bg-[linear-gradient(135deg,#005B96_0%,#0a4a7a_55%,#021d33_100%)] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <Sparkles className="h-6 w-6 shrink-0 text-sky-200" aria-hidden />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold sm:text-2xl">
                Studentské předplatné — od 149 Kč/měsíc
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-100">
                Free vrstva stačí na ochutnávku. Předplatné je pro ty, kdo chtějí pravidelnou
                přípravu nebo studijní oporu během semestru — uchazeči i studenti LF.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {SUB_BENEFITS.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-sky-50">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  asChild
                  className="rounded-full bg-white text-[#005B96] hover:bg-sky-50"
                >
                  <Link href="/predplatne?trial=1#student" data-cta="studenti-sub-trial">
                    {VIP_TRIAL_DAYS} dní zdarma
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  <Link href="/predplatne#student">Porovnat plány</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#021d33]">Další užitečné sekce</h2>
              <p className="mt-1 text-sm text-slate-600">
                Rozcestníky — vedou dál do obsahu MedScope, ne nahrazují celý předmět.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MORE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#005B96]/35 hover:bg-[#f8fbff]"
              >
                <BookOpen className="h-4 w-4 text-[#005B96]" aria-hidden />
                <p className="mt-2 font-medium text-[#021d33]">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
