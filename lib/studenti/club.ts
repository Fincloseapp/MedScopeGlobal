/** Student quiz club — CS faculty product. 1 free test, then intro + monthly plan. */

import { STUDENT_FREE_TESTS, STUDENT_MONTHLY_CZK } from "@/lib/studenti/pricing";

export const STUDENT_CLUB_FREE_RUNS = STUDENT_FREE_TESTS;
export const STUDENT_CLUB_PRICE_CZK = STUDENT_MONTHLY_CZK;
export const STUDENT_CLUB_STORAGE_RUNS = "ms_student_club_runs";
export const STUDENT_CLUB_STORAGE_NICK = "ms_student_club_nick";
export const STUDENT_CLUB_STORAGE_EMAIL = "ms_student_club_email";
export const STUDENT_CLUB_STORAGE_SCORES = "ms_student_club_scores";

export const STUDENT_CLUB_HREF = "/studenti/klub";
export const STUDENT_CLUB_BOARD_HREF = "/studenti/zebricek";
export const STUDENT_CLUB_PLAN_HREF = "/predplatne#student";

/** CS-only faculty product — keep labels Czech. */
export const STUDENT_SECTION_NAV = [
  { href: "/studenti", label: "Přehled" },
  { href: STUDENT_CLUB_HREF, label: "Kvízy" },
  { href: "/studenti/hry", label: "Odbornost" },
  { href: "/studenti/chci-studovat", label: "Univerzity" },
  { href: STUDENT_CLUB_BOARD_HREF, label: "Žebříček" },
  { href: "/studenti/testy", label: "Testy" },
  { href: "/studenti/materialy", label: "Materiály" },
] as const;

export type StudentClubScore = {
  nick: string;
  score: number;
  total: number;
  at: string;
};

export function normalizeStudentNick(raw: string): string {
  return String(raw || "")
    .replace(/[^\p{L}\p{N}_.\- ]/gu, "")
    .trim()
    .slice(0, 20);
}

export function isValidStudentEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function remainingFreeRuns(used: number, clubOpen: boolean): number {
  if (clubOpen) return Number.POSITIVE_INFINITY;
  return Math.max(0, STUDENT_CLUB_FREE_RUNS - Math.max(0, used));
}

export function canStartClubRun(used: number, clubOpen: boolean): boolean {
  return remainingFreeRuns(used, clubOpen) > 0;
}

export function rankClubScores(scores: StudentClubScore[], limit = 20): StudentClubScore[] {
  const best = new Map<string, StudentClubScore>();
  for (const row of scores) {
    const nick = normalizeStudentNick(row.nick);
    if (!nick) continue;
    const prev = best.get(nick.toLowerCase());
    if (!prev || row.score > prev.score) {
      best.set(nick.toLowerCase(), { ...row, nick: prev?.nick ?? nick });
    }
  }
  return [...best.values()]
    .sort((a, b) => b.score - a.score || Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
}
