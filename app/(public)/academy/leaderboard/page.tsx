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
        description="Nejaktivnější studenti MedScope Academy — týdenní, měsíční a celkový žebříček."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {entries.length > 0 ? (
          <ol className="space-y-2">
            {entries.map((entry, i) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="font-medium text-[#021d33]">#{i + 1}</span>
                <span className="flex-1 px-4 text-sm text-slate-600 font-mono truncate">{entry.user_id.slice(0, 8)}…</span>
                <span className="font-semibold text-[#005B96]">{entry.total_xp} XP</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center text-sm text-slate-500">Žebříček se naplní po prvních XP událostech.</p>
        )}
      </div>
    </>
  );
}
