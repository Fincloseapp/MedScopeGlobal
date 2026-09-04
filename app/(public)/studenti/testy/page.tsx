import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

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
    <>
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.1),transparent_35%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            MedScope · Studenti
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">
            Testy a procvičení
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Jedna mapa k procvičení — přijímačky, Academy kvízy i studijní hry. Nejde o oficiální
            zkoušku z fakulty, ale o rychlou zpětnou vazbu, která drží tempo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/studenti/klub">
                Otevřít klub kvízů
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/studenti/hry">Studijní hry</Link>
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
          <span>Testy</span>
        </nav>

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <ClipboardList className="h-4 w-4 text-[#005B96]" aria-hidden />
          <span>Pro uchazeče i studenty LF — začněte self-testem nebo krátkou hrou</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PATHS.map((item) => (
            <article
              key={item.href}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h2 className="font-display text-lg font-semibold text-[#021d33]">{item.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
              <div className="mt-4">
                <Button
                  asChild
                  variant={item.primary ? "default" : "outline"}
                  className={`rounded-full ${item.primary ? "bg-[#005B96]" : ""}`}
                >
                  <Link href={item.href}>
                    {item.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff] p-6">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">
            Chcete opakovat bez limitů?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Free vrstva stačí na ochutnávku. Studentské předplatné (od 149 Kč/měsíc) otevírá celou
            Academy a AI tutor — {VIP_TRIAL_DAYS} dní zdarma.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/predplatne?trial=1#student">
                {VIP_TRIAL_DAYS} dní zdarma
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
