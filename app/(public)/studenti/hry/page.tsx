import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { PublicModuleImage } from "@/components/v25/public-module-image";
import { Button } from "@/components/ui/button";
import { resolveStudyGameImageUrl } from "@/lib/v22/game-images";
import { V22_STUDY_GAMES } from "@/lib/v22/games";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export const metadata: Metadata = buildV20PageMetadata({
  title: "Kvízy a studijní hry — MedScope pro studenty",
  description:
    "Všechny studijní kvízy a hry MedScope: anatomie, fyziologie, patologie, terminologie, klinika i přijímačky. Plus Academy kvízy a self-test.",
  path: "/studenti/hry",
});

const EXTRA_TOOLS = [
  {
    href: "/academy/quizzes",
    title: "Academy kvízy",
    body: "Kvízy vázané na kurzy Academy — se zpětnou vazbou.",
  },
  {
    href: "/academy/prijimacky/self-test",
    title: "Self-test přijímaček",
    body: "Biologie, chemie, fyzika — losované otázky z banky.",
  },
  {
    href: "/kvizy",
    title: "Další kvízy",
    body: "Rozšířená knihovna kvízů včetně klinických témat.",
  },
  {
    href: "/studenti/testy",
    title: "Testy — rozcestník",
    body: "Přehled všech cest k procvičení a školním testům.",
  },
] as const;

export default async function StudentiHryPage() {
  const games = await Promise.all(
    V22_STUDY_GAMES.map(async (game) => ({
      ...game,
      imageUrl: await resolveStudyGameImageUrl(game.slug),
    }))
  );

  return (
    <>
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.1),transparent_35%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            MedScope · Studenti
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">
            Kvízy a studijní hry
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Kompletní přehled her a kvízů — nejen anatomie. Fyziologie, patologie, terminologie,
            klinika i přijímačky na jednom místě.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/medicina/hry">
                Otevřít všechny hry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/academy/quizzes">Academy kvízy</Link>
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
          <span>Kvízy a hry</span>
        </nav>

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Gamepad2 className="h-4 w-4 text-[#005B96]" aria-hidden />
          <span>{games.length} studijních her · průběžně doplňováno</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/medicina/hry/${game.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-[#005B96]/40 hover:shadow-sm"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                <PublicModuleImage
                  src={game.imageUrl}
                  alt={game.title}
                  sizes="33vw"
                  priority={game.slug === "anatomie-systemy"}
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
                  {game.topic}
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-[#005B96]">
                  {game.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {game.description}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {game.questions.length} otázek · {game.updatedAt}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">Další procvičení</h2>
          <p className="mt-1 text-sm text-slate-600">
            Academy kvízy a self-test — vhodné ke kurzům a přijímačkám.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {EXTRA_TOOLS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-[#005B96]/40 hover:bg-[#f8fbff]"
                >
                  <span>
                    <span className="block font-medium text-[#021d33]">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{item.body}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
