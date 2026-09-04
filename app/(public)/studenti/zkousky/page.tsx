import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
  title: "Zkoušky a semestr — MedScope pro studenty LF",
  description:
    "Orientace ke zkouškovému období: studijní plány, materiály, procvičení a AI tutor. Doplněk k fakultním skriptům — ne oficiální rozpis zkoušek.",
  path: "/studenti/zkousky",
});
}

const TOOLS = [
  {
    href: "/medicina/plany",
    title: "Studijní plány",
    body: "Strukturované cesty podle ročníku — ať víte, co opakovat v jakém pořadí.",
  },
  {
    href: "/studenti/materialy",
    title: "Studijní materiály",
    body: "Knihovna podkladů podle témat — rychlá orientace před zkouškou nebo zápočtem.",
  },
  {
    href: "/studenti/testy",
    title: "Testy a procvičení",
    body: "Kvízy a hry na krátké opakování — ideální den před testem.",
  },
  {
    href: "/studenti/ai-tutor",
    title: "AI tutor",
    body: "Doptat se na nejasnou látku, když není čas čekat na konzultaci.",
  },
  {
    href: "/studenti/hry",
    title: "Kvízy a studijní hry",
    body: "Anatomie, fyziologie, patologie — krátké session místo scrollování.",
  },
  {
    href: "/studenti/leky",
    title: "Léky (SÚKL)",
    body: "Vyhledávání léčiv — praktický rozcestník, ne farmakologický kurz.",
  },
] as const;

export default function StudentiZkouskyPage() {
  return (
    <>
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.1),transparent_35%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            MedScope · Studenti LF
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">
            Zkoušky a semestr
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Nástroje na opakování a orientaci během semestru. MedScope nenahrazuje oficiální termíny
            ani skripta z fakulty — pomáhá držet tempo a rychle dohledat látku.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/medicina/plany">
                Studijní plány
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/studenti/materialy">Materiály</Link>
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
          <Link href="/studenti" className="hover:text-foreground">
            Studenti
          </Link>
          <span className="mx-2">/</span>
          <span>Zkoušky</span>
        </nav>

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <CalendarCheck className="h-4 w-4 text-[#005B96]" aria-hidden />
          <span>Doporučený postup: plán → materiály → procvičení → AI tutor</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#005B96]/40 hover:bg-[#f8fbff]"
            >
              <h2 className="font-display text-lg font-semibold text-[#021d33]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
              <span className="mt-3 inline-flex items-center text-sm font-medium text-[#005B96]">
                Otevřít
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff] p-6">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">
            Opora během semestru
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Studentské předplatné otevírá AI tutor a plný přístup k Academy — 1 test zdarma,
            první měsíc 89 Kč, další 149 Kč. Zrušíte kdykoli.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/predplatne#student">
                89 Kč první měsíc
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/studenti">Zpět na Studenti</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
