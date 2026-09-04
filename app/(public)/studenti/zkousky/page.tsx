import type { Metadata } from "next";
import { StudentLink as Link } from "@/components/studenti/student-link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
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
    <StudentAtelierShell
      current="/studenti/zkousky"
      kicker="Ateliér · Semestr"
      title="Zkoušky a semestr"
      lead="Nástroje na opakování a orientaci během semestru. MedScope nenahrazuje oficiální termíny ani skripta z fakulty — pomáhá držet tempo a rychle dohledat látku."
      actions={
        <>
          <Link href="/medicina/plany" className={atelierPrimaryLink()}>
            Studijní plány
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/studenti/materialy" className={atelierGhostLink()}>
            Materiály
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-center gap-2 text-sm text-[#5c564c]">
        <CalendarCheck className="h-4 w-4 text-[#8a6d32]" aria-hidden />
        <span>Doporučený postup: plán → materiály → procvičení → AI tutor</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-[#1b1712]/12 bg-white/80 p-5 transition hover:border-[#8a6d32]/50"
          >
            <h2 className="font-display text-lg font-semibold text-[#1b1712]">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c564c]">{item.body}</p>
            <span className="mt-3 inline-flex items-center text-sm font-medium text-[#8a6d32]">
              Otevřít
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-12 border-t border-[#1b1712]/10 pt-8">
        <h2 className="font-display text-xl font-semibold text-[#1b1712]">Opora během semestru</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c564c]">
          Studentské předplatné otevírá AI tutor a plný přístup k Academy — 1 test zdarma, první měsíc
          89 Kč, další 149 Kč. Zrušíte kdykoli.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/predplatne#student" className={atelierPrimaryLink()}>
            89 Kč první měsíc
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/studenti" className={atelierGhostLink()}>
            Zpět na Studenti
          </Link>
        </div>
      </section>
    </StudentAtelierShell>
  );
}
