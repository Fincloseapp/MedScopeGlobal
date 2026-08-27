import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
  title: "Léky a léčiva — MedScope pro studenty",
  description:
    "Přehled léčiv (SÚKL), studijní odkazy a AI tutor. Není to kompletní kurz farmakologie — je to praktický rozcestník k lékům a učení.",
  path: "/studenti/leky",
});
}

const LINKS = [
  {
    href: "/leky",
    title: "Katalog léků (SÚKL)",
    body: "Vyhledávání léčiv a základních informací — praktická reference, ne učebnice mechanismů.",
  },
  {
    href: "/medicina/studium",
    title: "Studijní obsah medicíny",
    body: "Širší studijní materiály a odkazy ke studiu na LF.",
  },
  {
    href: "/studenti/ai-tutor",
    title: "AI tutor",
    body: "Rychlé vysvětlení pojmů a mechanismů na vyžádání.",
  },
  {
    href: "/kvizy",
    title: "Kvízy (včetně farmakologických témat)",
    body: "Procvičení tam, kde je kvíz dostupný — ne nahrazuje přednášky z farmakologie.",
  },
  {
    href: "/studenti/hry",
    title: "Kvízy a studijní hry",
    body: "Kompletní hub her: anatomie, fyziologie, patologie, klinika…",
  },
] as const;

export default function StudentiLekyPage() {
  return (
    <>
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.1),transparent_35%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            MedScope · Studenti
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">
            Léky a léčiva
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Praktický rozcestník k léčivům a studijní podpoře.{" "}
            <strong className="font-semibold text-[#021d33]">
              Není to samostatný kurz farmakologie
            </strong>{" "}
            — mechanismy, dávkování a kliniku doplňujte materiály z LF a AI tutorem.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/leky">
                Otevřít katalog léků
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/studenti/ai-tutor">AI tutor</Link>
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
          <span>Léky</span>
        </nav>

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <Pill className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Dřívější název „Farmakologie“ mohl působit jako plný předmět. Tato stránka záměrně
            pojmenovává, co opravdu nabízíme: léky (SÚKL), studijní odkazy a procvičení.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#005B96]/40 hover:bg-[#f8fbff]"
              >
                <span>
                  <span className="block font-medium text-[#021d33]">{item.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    {item.body}
                  </span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
