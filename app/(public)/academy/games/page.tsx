import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { listStudyGames } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyGamesPage() {
  const games = await listStudyGames();

  return (
    <>
      <AcademyPageHeader
        eyebrow="Study games"
        title="Vzdělávací hry"
        description="Gamifikované procvičování — quiz race, flashcards a další."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {games.length > 0 ? (
          <ul className="space-y-3">
            {games.map((game) => (
              <li key={game.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="font-display text-lg font-semibold">{game.title}</h2>
                <p className="text-sm text-slate-600">{game.game_type}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-slate-500">Hry se připravují ve fázi 3.</p>
        )}
        <Link href="/medicina/hry" className="mt-6 inline-block text-sm text-[#005B96] hover:underline">
          ← Existující MedScope hry
        </Link>
      </div>
    </>
  );
}
