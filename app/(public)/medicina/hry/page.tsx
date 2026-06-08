import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { V22_STUDY_GAMES } from "@/lib/v22/games";

export const metadata: Metadata = {
  title: "Studijní hry a kvízy",
  description: "Vzdělávací kvízy pro studenty medicíny — anatomie, fyziologie, patologie a přijímačky.",
};

export default function MedicinaHryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/medicina" className="text-sm font-medium text-primary hover:underline">
        ← Studium medicíny
      </Link>
      <header className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Vzdělávací hry</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Kvízy a studijní hry</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Originální vzdělávací obsah MedScope pro procvičení anatomie, fyziologie, patologie a
          přípravy na přijímačky. Obsah je průběžně aktualizován.
        </p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {V22_STUDY_GAMES.map((game) => (
          <Link
            key={game.slug}
            href={`/medicina/hry/${game.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] bg-slate-100">
              <Image src={game.imageUrl} alt="" fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{game.topic}</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">
                {game.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{game.description}</p>
              <p className="mt-2 text-xs text-slate-400">
                {game.questions.length} otázek · aktualizováno {game.updatedAt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
