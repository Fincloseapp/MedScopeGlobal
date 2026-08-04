import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
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
    title: "Pro studenty a uchazeče o medicínu",
    description:
      "Přehledná orientace: příprava na přijímačky LF, studijní materiály, testy a AI tutor. Začněte zdarma.",
    path: "/studenti",
  });
}

const APPLICANT_LINKS = [
  {
    href: "/academy/courses?category=prijimacky",
    title: "Přípravné kurzy",
    body: "Biologie, chemie, fyzika, fyziologie — ≈30 % zdarma",
  },
  {
    href: "/academy/prijimacky/self-test",
    title: "Self-test přijímaček",
    body: "Rychlé ověření úrovně B / C / F",
  },
  {
    href: "/studium/prijimacky",
    title: "Termíny a fakulty",
    body: "Požadavky a deadliny českých LF",
  },
];

const STUDENT_LINKS = [
  {
    href: "/studenti/materialy",
    title: "Studijní materiály",
    body: "Knihovna podle ročníku a předmětu",
  },
  {
    href: "/studenti/testy",
    title: "Testy a kvízy",
    body: "Procvičení ke zkouškám a školním testům",
  },
  {
    href: "/studenti/ai-tutor",
    title: "AI tutor",
    body: "Vysvětlení látky a tipy na opakování",
  },
];

export default function StudentiHubPage() {
  return (
    <>
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.1),transparent_35%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            Studenti
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">
            Kam teď patříte?
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Dvě jasné cesty — bez bloudění. Začněte zdarma, pokračujte předplatným, až vám to
            sedne.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Domů
          </Link>
          <span className="mx-2">/</span>
          <span>Studenti</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#cfe1f3] bg-white p-6 shadow-[0_18px_40px_-30px_rgba(0,91,150,0.45)]">
            <div className="flex items-center gap-3">
              <Target className="h-7 w-7 text-[#005B96]" aria-hidden />
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#021d33]">
                  Chci na medicínu
                </h2>
                <p className="text-sm text-slate-600">Uchazeč / gymnázium → přijímačky LF</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Kurzy, self-test a termíny fakult. První lekce každého kurzu je zdarma — ideální
              první pozitivní zkušenost před objednávkou.
            </p>
            <ul className="mt-5 space-y-2">
              {APPLICANT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#005B96]/40 hover:bg-[#f8fbff]"
                  >
                    <span>
                      <span className="block font-medium text-[#021d33]">{link.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{link.body}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild className="rounded-full bg-[#005B96]">
                <Link href="/studenti/chci-studovat">
                  Spustit přípravu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/academy/courses/fyziologie-zaklady-uchazece">
                  Ukázka: Fyziologie
                </Link>
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-7 w-7 text-[#005B96]" aria-hidden />
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#021d33]">
                  Už studuji na LF
                </h2>
                <p className="text-sm text-slate-600">1.–6. ročník · zkoušky a opakování</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Materiály, testy a AI tutor pro každodenní studium. Rychlá orientace místo dlouhého
              hledání.
            </p>
            <ul className="mt-5 space-y-2">
              {STUDENT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#005B96]/40 hover:bg-[#f8fbff]"
                  >
                    <span>
                      <span className="block font-medium text-[#021d33]">{link.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{link.body}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild className="rounded-full bg-[#005B96]">
                <Link href="/studenti/materialy">
                  Otevřít materiály
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/predplatne">Předplatné 149 Kč</Link>
              </Button>
            </div>
          </section>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link
            href="/studenti/anatomie"
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/35"
          >
            <BookOpen className="h-5 w-5 text-[#005B96]" aria-hidden />
            <p className="mt-2 font-medium text-[#021d33]">Anatomie</p>
            <p className="mt-1 text-xs text-slate-500">Výklady a kvízy</p>
          </Link>
          <Link
            href="/studenti/farmakologie"
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/35"
          >
            <Brain className="h-5 w-5 text-[#005B96]" aria-hidden />
            <p className="mt-2 font-medium text-[#021d33]">Farmakologie</p>
            <p className="mt-1 text-xs text-slate-500">Léky a mechanismy</p>
          </Link>
          <Link
            href="/studenti/zkousky"
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/35"
          >
            <ClipboardList className="h-5 w-5 text-[#005B96]" aria-hidden />
            <p className="mt-2 font-medium text-[#021d33]">Zkoušky</p>
            <p className="mt-1 text-xs text-slate-500">Plány a příprava</p>
          </Link>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff] px-5 py-4">
          <Sparkles className="h-5 w-5 text-[#005B96]" aria-hidden />
          <p className="flex-1 text-sm text-slate-700">
            <strong>Tip:</strong> Začněte jednou lekcí zdarma. Když vám to pomůže, předplatné a
            doporučení spolužákům přijde samo.
          </p>
          <Button asChild size="sm" className="rounded-full bg-[#005B96]">
            <Link href="/predplatne">Předplatné</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
