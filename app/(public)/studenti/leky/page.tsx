import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Pill } from "lucide-react";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
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
    <StudentAtelierShell
      current="/studenti/leky"
      kicker="Ateliér · Léky"
      title="Léky a léčiva"
      lead="Praktický rozcestník k léčivům a studijní podpoře. Není to samostatný kurz farmakologie — mechanismy, dávkování a kliniku doplňujte materiály z LF a AI tutorem."
      actions={
        <>
          <Link href="/leky" className={atelierPrimaryLink()}>
            Otevřít katalog léků
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/studenti/ai-tutor" className={atelierGhostLink()}>
            AI tutor
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#8a6d32]/25 bg-[#f6f1e8] px-4 py-3 text-sm text-[#1b1712]">
        <Pill className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6d32]" aria-hidden />
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
              className="flex h-full items-start justify-between gap-3 rounded-2xl border border-[#1b1712]/12 bg-white/80 px-4 py-4 transition hover:border-[#8a6d32]/50"
            >
              <span>
                <span className="block font-medium text-[#1b1712]">{item.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-[#5c564c]">{item.body}</span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8a6d32]" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </StudentAtelierShell>
  );
}
