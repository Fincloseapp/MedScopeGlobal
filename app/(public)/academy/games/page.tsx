import { AcademyPageHeader } from "@/components/academy/page-header";
import { listStudyGames } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyGamesPage() {
  const games = await listStudyGames(20);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Hry"
        title="Studijní hry"
        description="Gamifikované učení — kvízové závody a flashcards."
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {games.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {games.map((g) => (
              <li key={g.id} className="rounded-xl border border-[#cfe1f3] bg-white p-5">
                <h2 className="font-semibold text-[#021d33]">{g.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{g.game_type}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-slate-500">Studijní hry budou brzy k dispozici.</p>
        )}
      </div>
    </>
  );
}
