import Link from "next/link";
import { Trophy } from "lucide-react";
import type { PublicHealthLeaderboardEntry } from "@/types/public-osveta";

export function PublicLeaderboard({ entries }: { entries: PublicHealthLeaderboardEntry[] }) {
  if (!entries.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Žebříček se naplní, až uživatelé začnou sledovat videa a plnit kvízy.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry, i) => (
        <li
          key={entry.user_id}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              i === 0
                ? "bg-amber-100 text-amber-700"
                : i === 1
                  ? "bg-slate-200 text-slate-600"
                  : i === 2
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-50 text-slate-500"
            }`}
          >
            {i < 3 ? <Trophy className="h-4 w-4" /> : i + 1}
          </span>
          <span className="flex-1 truncate text-sm font-medium text-[#021d33]">
            {entry.display_name ?? `Uživatel ${entry.user_id.slice(0, 6)}`}
          </span>
          <span className="shrink-0 font-semibold text-[#005B96]">{entry.total_xp} XP</span>
        </li>
      ))}
    </ol>
  );
}

export function PublicLeaderboardCta() {
  return (
    <Link
      href="/verejnost/zebricek"
      className="inline-flex items-center gap-2 rounded-full border border-[#005B96]/30 px-4 py-2 text-sm font-medium text-[#005B96] transition hover:bg-[#005B96]/5"
    >
      <Trophy className="h-4 w-4" />
      Celý žebříček →
    </Link>
  );
}
