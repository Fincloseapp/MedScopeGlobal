import { AcademyPageHeader } from "@/components/academy/page-header";
import { getLeaderboard } from "@/lib/academy/db";

export const revalidate = 60;

export default async function AcademyLeaderboardPage() {
  const entries = await getLeaderboard("all_time", 25);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Gamifikace"
        title="Žebříček XP"
        description="Nejaktivnější studenti MedScope Academy."
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {entries.length > 0 ? (
          <ol className="space-y-2">
            {entries.map((e, i) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-[#cfe1f3] bg-white px-4 py-3"
              >
                <span className="font-medium text-[#021d33]">#{i + 1}</span>
                <span className="text-sm text-slate-600">{e.user_id.slice(0, 8)}…</span>
                <span className="font-semibold text-[#005B96]">{e.total_xp} XP</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center text-sm text-slate-500">Žebříček je zatím prázdný. Získejte XP studiem kurzů.</p>
        )}
      </div>
    </>
  );
}
