import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";

export type NewsletterStandLane = "upcoming" | "current" | "previous";

export type ClassifiedNewsletterStand = {
  upcoming: NewsletterRow[];
  current: NewsletterRow | null;
  previous: NewsletterRow[];
  all: NewsletterRow[];
};

function issueDay(row: Pick<NewsletterRow, "issue_date">): string {
  return String(row.issue_date ?? "").slice(0, 10);
}

function todayStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Merge archive + featured latest, newest first, unique by slug. */
export function mergeNewsletterIssues(
  archive: NewsletterRow[],
  latest?: NewsletterRow | null
): NewsletterRow[] {
  const bySlug = new Map<string, NewsletterRow>();
  for (const row of [...archive, ...(latest ? [latest] : [])]) {
    if (!row?.slug) continue;
    bySlug.set(row.slug, row);
  }
  return [...bySlug.values()].sort((a, b) => issueDay(b).localeCompare(issueDay(a)));
}

/**
 * Current = newest issued on or before today.
 * Upcoming = published with a future issue_date (valid for the future).
 * Previous = older released issues.
 */
export function classifyNewsletterIssues(
  rows: NewsletterRow[],
  now = new Date()
): ClassifiedNewsletterStand {
  const today = todayStamp(now);
  const upcoming = rows
    .filter((row) => issueDay(row) > today)
    .sort((a, b) => issueDay(a).localeCompare(issueDay(b)));
  const released = rows
    .filter((row) => issueDay(row) && issueDay(row) <= today)
    .sort((a, b) => issueDay(b).localeCompare(issueDay(a)));
  const current = released[0] ?? null;
  const previous = released.slice(1);
  return {
    upcoming,
    current,
    previous,
    all: [...upcoming, ...released],
  };
}

export function laneForIssue(
  row: Pick<NewsletterRow, "issue_date">,
  currentSlug?: string | null,
  now = new Date()
): NewsletterStandLane {
  const day = issueDay(row);
  const today = todayStamp(now);
  if (day > today) return "upcoming";
  if (currentSlug && row && "slug" in row && (row as NewsletterRow).slug === currentSlug) {
    return "current";
  }
  if (day === today) return "current";
  return "previous";
}
