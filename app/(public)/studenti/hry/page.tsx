import type { Metadata } from "next";
import { StudentLink as Link } from "@/components/studenti/student-link";
import { ArrowRight, Gamepad2 } from "lucide-react";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
import { PublicModuleImage } from "@/components/v25/public-module-image";
import { resolveStudyGameImageUrlSync } from "@/lib/v22/game-images";
import { V22_STUDY_GAMES } from "@/lib/v22/games";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Kvízy a studijní hry — MedScope pro studenty",
    description:
      "Všechny studijní kvízy a hry MedScope: anatomie, fyziologie, patologie, terminologie, klinika i přijímačky. Plus Academy kvízy a self-test.",
    path: "/studenti/hry",
  });
}

const EXTRA_TOOLS = [
  {
    href: "/studenti/klub",
    title: "Klub kvízů a žebříček",
    body: "Soutěžní kola z banky přijímaček. 1 test zdarma, první měsíc 89 Kč, pak 149 Kč.",
  },
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
      imageUrl: await resolveStudyGameImageUrlSync(game.slug),
    }))
  );

  return (
    <StudentAtelierShell
      current="/studenti/hry"
      kicker="Ateliér · Hry"
      title="Kvízy a studijní hry"
      lead="Kompletní přehled her a kvízů — nejen anatomie. Fyziologie, patologie, terminologie, klinika i přijímačky na jednom místě."
      actions={
        <>
          <Link href="/medicina/hry" className={atelierPrimaryLink()}>
            Otevřít všechny hry
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/studenti/klub" className={atelierGhostLink()}>
            Klub kvízů
          </Link>
          <Link href="/academy/quizzes" className={atelierGhostLink()}>
            Academy kvízy
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-center gap-2 text-sm text-[#5c564c]">
        <Gamepad2 className="h-4 w-4 text-[#8a6d32]" aria-hidden />
        <span>{games.length} studijních her · průběžně doplňováno</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/medicina/hry/${game.slug}`}
            className="group overflow-hidden rounded-2xl border border-[#1b1712]/12 bg-white/80 transition hover:border-[#8a6d32]/50"
          >
            <div className="relative aspect-[16/10] bg-[#e8e2d6]">
              <PublicModuleImage
                src={game.imageUrl}
                alt={game.title}
                sizes="33vw"
                priority={game.slug === "anatomie-systemy"}
              />
            </div>
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a6d32]">
                {game.topic}
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold text-[#1b1712] group-hover:text-[#8a6d32]">
                {game.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5c564c]">
                {game.description}
              </p>
              <p className="mt-2 text-xs text-[#8a8377]">
                {game.questions.length} otázek · {game.updatedAt}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-[#1b1712]">Další procvičení</h2>
        <p className="mt-1 text-sm text-[#5c564c]">
          Academy kvízy a self-test — vhodné ke kurzům a přijímačkám.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {EXTRA_TOOLS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#1b1712]/12 bg-white/80 px-4 py-3 transition hover:border-[#8a6d32]/50"
              >
                <span>
                  <span className="block font-medium text-[#1b1712]">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-[#5c564c]">{item.body}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8a6d32]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </StudentAtelierShell>
  );
}
