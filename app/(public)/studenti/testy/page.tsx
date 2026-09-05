import type { Metadata } from "next";
import { StudentLink as Link } from "@/components/studenti/student-link";
import { ArrowRight, ClipboardList } from "lucide-react";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Testy a procvičení — MedScope pro studenty",
    description:
      "Self-test přijímaček, Academy kvízy a studijní hry. Procvičení pro uchazeče o LF i studenty fakulty — s okamžitou zpětnou vazbou.",
    path: "/studenti/testy",
  });
}

const PATHS = [
  {
    href: "/studenti/klub",
    title: "Klub kvízů a žebříček",
    body: "Soutěžní kola z banky přijímaček pod přezdívkou. 1 test zdarma, první měsíc 89 Kč, pak 149 Kč — zrušíte kdykoli.",
    cta: "Otevřít klub",
    primary: true,
  },
  {
    href: "/academy/prijimacky/self-test",
    title: "Self-test přijímaček",
    body: "Biologie, chemie, fyzika — losované otázky a vysvětlení po odevzdání. Ideální první krok pro gymnazisty.",
    cta: "Spustit self-test",
    primary: false,
  },
  {
    href: "/academy/quizzes",
    title: "Academy kvízy",
    body: "Kvízy vázané na kurzy — opakování po lekci se zpětnou vazbou.",
    cta: "Otevřít kvízy",
    primary: false,
  },
  {
    href: "/studenti/hry",
    title: "Kvízy a studijní hry",
    body: "Krátké hry na anatomii, fyziologii, patologii i přijímačky — rychlé opakování.",
    cta: "Otevřít hry",
    primary: false,
  },
  {
    href: "/academy/courses?category=prijimacky",
    title: "Přípravné kurzy + kvíz",
    body: "Lekce a kvíz v jednom balíčku. První lekce každého kurzu zdarma.",
    cta: "Začít kurzy",
    primary: false,
  },
] as const;

export default function StudentiTestyPage() {
  return (
    <StudentAtelierShell
      current="/studenti/testy"
      kicker="Ateliér · Testy"
      title="Testy a procvičení"
      lead="Jedna mapa k procvičení — přijímačky, Academy kvízy i studijní hry. Nejde o oficiální zkoušku z fakulty, ale o rychlou zpětnou vazbu, která drží tempo."
      actions={
        <>
          <Link href="/studenti/klub" className={atelierPrimaryLink()}>
            Otevřít klub kvízů
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/studenti/hry" className={atelierGhostLink()}>
            Studijní hry
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-center gap-2 text-sm text-[#5c564c]">
        <ClipboardList className="h-4 w-4 text-[#8a6d32]" aria-hidden />
        <span>Pro uchazeče i studenty LF — začněte self-testem nebo krátkou hrou</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PATHS.map((item) => (
          <article
            key={item.href}
            className="flex flex-col rounded-2xl border border-[#1b1712]/12 bg-white/80 p-5"
          >
            <h2 className="font-display text-lg font-semibold text-[#1b1712]">{item.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5c564c]">{item.body}</p>
            <div className="mt-4">
              <Link
                href={item.href}
                className={item.primary ? atelierPrimaryLink() : atelierGhostLink()}
              >
                {item.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-12 border-t border-[#1b1712]/10 pt-8">
        <h2 className="font-display text-xl font-semibold text-[#1b1712]">Chcete opakovat bez limitů?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c564c]">
          Free vrstva stačí na ochutnávku. Studentské předplatné otevírá celou Academy a AI tutor —
          1 test zdarma, první měsíc 89 Kč, další 149 Kč. Není to 14denní trial.
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
