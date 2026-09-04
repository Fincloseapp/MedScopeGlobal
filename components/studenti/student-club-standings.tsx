"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  STUDENT_CLUB_HREF,
  STUDENT_CLUB_STORAGE_SCORES,
  rankClubScores,
  type StudentClubScore,
} from "@/lib/studenti/club";

function readScores(): StudentClubScore[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STUDENT_CLUB_STORAGE_SCORES);
    return raw ? (JSON.parse(raw) as StudentClubScore[]) : [];
  } catch {
    return [];
  }
}

export function StudentClubStandings({ limit = 20 }: { limit?: number }) {
  const [rows, setRows] = useState<StudentClubScore[] | null>(null);

  useEffect(() => {
    setRows(rankClubScores(readScores(), limit));
  }, [limit]);

  if (rows === null) {
    return <p className="text-sm text-slate-500">Načítám žebříček…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <p className="font-semibold text-[#1b1712]">Zatím tu nikdo není</p>
        <p className="mt-2">
          Žebříček ukazuje jen přezdívky z tohoto zařízení — žádná vymyšlená jména. Po prvním
          odevzdaném kole se tu objeví váš nick.
        </p>
        <Link href={STUDENT_CLUB_HREF} className="mt-3 inline-block font-semibold text-[#8a6d32] hover:underline">
          Spustit první kolo →
        </Link>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {rows.map((row, index) => (
        <li key={`${row.nick}-${row.at}`} className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="min-w-0">
            <span className="mr-2 text-xs font-semibold text-slate-400">{index + 1}.</span>
            <span className="font-medium text-[#1b1712]">{row.nick}</span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-[#8a6d32]">
            {row.score}/{row.total}
          </span>
        </li>
      ))}
    </ol>
  );
}
