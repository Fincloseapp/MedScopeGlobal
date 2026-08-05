import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "MedScope pro studenty a uchazeče o medicínu",
    description:
      "Vyberte cestu: příprava na přijímačky LF, nebo materiály a testy pro studenty fakulty. Přehledně, pravdivě, začněte zdarma.",
    path: "/studenti",
  });
}

const APPLICANT = [
  {
    href: "/academy/courses?category=prijimacky",
    title: "Přípravné kurzy Academy",
    body: "Biologie, chemie, fyzika, fyziologie — lekce, slidy a kvízy. První lekce zdarma.",
  },
  {
    href: "/academy/prijimacky/self-test",
    title: "Self-test přijímaček",
    body: "Losované otázky B / C / F s vysvětlením po odevzdání.",
  },
  {
    href: "/studium/prijimacky",
    title: "Termíny a požadavky LF",
    body: "Přehled českých lékařských fakult a přijímacího řízení.",
  },
] as const;

const ON_LF = [
  {
    href: "/studenti/materialy",
    title: "Studijní materiály",
    body: "Kurátorovaná knihovna — filtr podle ročníku a předmětu, čtení online.",
  },
  {
    href: "/studenti/testy",
    title: "Testy a kvízy",
    body: "Academy kvízy, self-test a odkazy na procvičení ke zkouškám.",
  },
  {
    href: "/studenti/ai-tutor",
    title: "AI tutor",
    body: "Rychlé vysvětlení látky a tipy na opakování — studentský asistent.",
  },
] as const;

const MORE = [
  {
    href: "/studenti/hry",
    title: "Kvízy a hry",
    body: "Anatomie, fyziologie, patologie, klinika i přijímačky",
  },
  {
    href: "/studenti/leky",
    title: "Léky a léčiva",
    body: "SÚKL katalog — ne plný kurz farmakologie",
  },
  {
    href: "/studenti/zkousky",
    title: "Zkoušky",
    body: "Plány a nástroje na přípravu ke zkouškám LF",
  },
  {
    href: "/medicina/plany",
    title: "Studijní plány",
    body: "Harmonogramy podle ročníku",
  },
] as const;

export default function StudentiHubPage() {
  return (
    <>
      <style>{`
        @keyframes msg-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes msg-soft-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.55; }
        }
        .msg-hero-copy { animation: msg-fade-up 0.7s ease-out both; }
        .msg-hero-cta { animation: msg-fade-up 0.7s ease-out 0.12s both; }
        .msg-path { animation: msg-fade-up 0.65s ease-out 0.2s both; }
        .msg-glow {
          animation: msg-soft-pulse 7s ease-in-out infinite;
        }
      `}</style>

      <section
        className="relative overflow-hidden border-b border-[#d9e8f4]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(0,91,150,0.16), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(2,29,51,0.08), transparent 50%), linear-gradient(165deg, #f7fbff 0%, #eef5fb 45%, #f8fafc 100%)",
        }}
      >
        <div
          className="msg-glow pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#005B96]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="msg-hero-copy text-[11px] font-semibold uppercase tracking-[0.3em] text-[#005B96]">
            MedScope · Studenti
          </p>
          <h1 className="msg-hero-copy mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-[#021d33] sm:text-5xl">
            MedScope pro cestu na medicínu
            <span className="block text-[0.85em] font-semibold text-[#005B96] sm:mt-1">
              i studium na LF
            </span>
          </h1>
          <p className="msg-hero-copy mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Jedna přehledná mapa: přijímačky, materiály, testy. Začněte zdarma — bez bloudění a bez
            prázdných slibů.
          </p>
          <div className="msg-hero-cta mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96] px-6">
              <Link href="/studenti/chci-studovat">
                Chci na medicínu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#005B96]/35 px-6">
              <Link href="/studenti/materialy">Už studuji na LF</Link>
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6">
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
            <div className="mt-5">
              <Button asChild className="rounded-full bg-[#005B96]">
                <Link href="/studenti/materialy">
                  Otevřít studijní materiály
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#021d33]">Další užitečné sekce</h2>
              <p className="mt-1 text-sm text-slate-600">
                Rozcestníky — vedou dál do obsahu MedScope, ne nahrazují celý předmět.
              </p>
            </div>
            <Link
              href="/predplatne"
              className="text-sm font-medium text-[#005B96] underline-offset-2 hover:underline"
            >
              Studentské předplatné od 149 Kč →
            </Link>
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

        <section className="mt-10 overflow-hidden rounded-3xl border border-[#cfe1f3] bg-[linear-gradient(135deg,#f0f7ff_0%,#ffffff_55%,#eef6fc_100%)] p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <Sparkles className="h-6 w-6 shrink-0 text-[#005B96]" aria-hidden />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold text-[#021d33]">
                Proč se sem vracet
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700">
                Jedna lekce zdarma ukáže styl. Self-test dá rychlou zpětnou vazbu. Materiály a kvízy
                drží tempo během semestru. MedScope má být klidný, opakovaně použitelný studijní
                prostor — ne jednorázová reklama.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-[#005B96]">
                  <Link href="/academy/courses?category=prijimacky">
                    Začít lekcí zdarma
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/academy/prijimacky/self-test">Spustit self-test</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Domů MedScope
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
