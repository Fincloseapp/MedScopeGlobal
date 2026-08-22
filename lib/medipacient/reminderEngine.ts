import { buildControlIcs, controlEventTitle } from "@/lib/medipacient/control-calendar";
import { isoUtc, pragueTodayIso, toUtcNoon, type VisitPlanStored } from "@/lib/medipacient/medicalParserCZ";

export type ReminderKind = "7d" | "24h" | "visit" | "repeat";
export type ReminderStatus = "open" | "done" | "dismissed";

export type ScheduledReminder = {
  id: string;
  documentId: string;
  fireAt: string;
  visitAt: string;
  kind: ReminderKind;
  title: string;
  details: string;
  status: ReminderStatus;
  emailSentOn?: string | null;
};

export type ReminderCandidate = {
  fireAt: string;
  visitAt: string;
  kind: ReminderKind;
  title: string;
};

function addDaysIso(iso: string, days: number): string {
  const d = toUtcNoon(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return isoUtc(d);
}

function monthsFromIso(iso: string, months: number): string {
  const [y0, m0, day] = iso.split("-").map(Number);
  const year = y0 + Math.floor((m0 - 1 + months) / 12);
  const month = (m0 - 1 + months) % 12;
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return isoUtc(new Date(Date.UTC(year, month, Math.min(day, last), 12, 0, 0)));
}

export function reminderId(documentId: string, fireAt: string, kind: ReminderKind): string {
  return `${documentId}:${kind}:${fireAt}`;
}

export function candidatesFromVisit(opts: {
  visitIso: string;
  title?: string;
  todayIso?: string;
}): ReminderCandidate[] {
  const today = opts.todayIso || pragueTodayIso();
  const visitAt = opts.visitIso.slice(0, 10);
  const title = opts.title || "Kontrola u lékaře";
  const out: ReminderCandidate[] = [];
  const seven = addDaysIso(visitAt, -7);
  const one = addDaysIso(visitAt, -1);
  if (seven >= today && seven < visitAt) {
    out.push({ fireAt: seven, visitAt, kind: "7d", title });
  }
  if (one >= today && one < visitAt) {
    out.push({ fireAt: one, visitAt, kind: "24h", title });
  }
  if (visitAt >= today) {
    out.push({ fireAt: visitAt, visitAt, kind: "visit", title });
  }
  return out;
}

export function repeatingVisitDates(opts: {
  startIso: string;
  intervalMonths: number;
  todayIso?: string;
  count?: number;
}): string[] {
  const today = opts.todayIso || pragueTodayIso();
  const count = opts.count ?? 8;
  const dates: string[] = [];
  let cursor = opts.startIso.slice(0, 10);
  if (cursor < today) {
    while (cursor < today) cursor = monthsFromIso(cursor, opts.intervalMonths);
  }
  for (let i = 0; i < count; i++) {
    dates.push(cursor);
    cursor = monthsFromIso(cursor, opts.intervalMonths);
  }
  return dates;
}

export function scheduleRemindersFromPlan(opts: {
  documentId: string;
  visitPlan: VisitPlanStored | null;
  controlDate?: string | null;
  obor?: string | null;
  todayIso?: string;
}): ScheduledReminder[] {
  const visitAt = opts.visitPlan?.dateIso || opts.controlDate || null;
  if (!visitAt) return [];
  const today = opts.todayIso || pragueTodayIso();
  const title = controlEventTitle(opts.obor);
  const details = opts.visitPlan?.originalText || "";
  const visits = [visitAt];
  const interval = opts.visitPlan?.intervalMonths;
  if (opts.visitPlan?.repeating && interval && interval > 0) {
    visits.push(
      ...repeatingVisitDates({ startIso: visitAt, intervalMonths: interval, todayIso: today }).filter(
        (d) => d !== visitAt,
      ),
    );
  }

  const scheduled: ScheduledReminder[] = [];
  const seen = new Set<string>();
  for (const visit of visits) {
    const kindBase: ReminderKind = visit === visitAt ? "visit" : "repeat";
    const cands =
      kindBase === "repeat"
        ? [
            ...candidatesFromVisit({ visitIso: visit, title, todayIso: today }).map((c) => ({
              ...c,
              kind: c.kind === "visit" ? ("repeat" as const) : c.kind,
            })),
          ]
        : candidatesFromVisit({ visitIso: visit, title, todayIso: today });
    for (const cand of cands) {
      const id = reminderId(opts.documentId, cand.fireAt, cand.kind);
      if (seen.has(id)) continue;
      seen.add(id);
      scheduled.push({
        id,
        documentId: opts.documentId,
        fireAt: cand.fireAt,
        visitAt: cand.visitAt,
        kind: cand.kind,
        title: cand.title,
        details,
        status: "open",
        emailSentOn: null,
      });
    }
  }
  return scheduled.sort((a, b) => a.fireAt.localeCompare(b.fireAt));
}

export function mergeReminderLists(
  latest: ScheduledReminder[] = [],
  incoming: ScheduledReminder[] = [],
  deletedIds: string[] = [],
): ScheduledReminder[] {
  const deleted = new Set(deletedIds);
  const byId = new Map<string, ScheduledReminder>();
  for (const item of latest) {
    if (!item?.id || deleted.has(item.id)) continue;
    byId.set(item.id, item);
  }
  for (const item of incoming) {
    if (!item?.id || deleted.has(item.id)) continue;
    const prev = byId.get(item.id);
    if (prev && prev.status !== "open" && item.status === "open") {
      byId.set(item.id, { ...item, status: prev.status, emailSentOn: prev.emailSentOn ?? item.emailSentOn });
      continue;
    }
    if (prev?.emailSentOn && !item.emailSentOn) {
      byId.set(item.id, { ...item, emailSentOn: prev.emailSentOn, status: prev.status });
      continue;
    }
    byId.set(item.id, prev ? { ...prev, ...item } : item);
  }
  return [...byId.values()].sort((a, b) => a.fireAt.localeCompare(b.fireAt));
}

export function remindersDueToday(list: ScheduledReminder[], todayIso: string): ScheduledReminder[] {
  return list.filter(
    (item) => item.status === "open" && item.fireAt <= todayIso && !item.emailSentOn,
  );
}

export function reminderIcs(item: ScheduledReminder): string {
  return buildControlIcs({
    date: item.visitAt,
    title: item.title,
    details: item.details || `Připomínka MeDipacient (${item.kind})`,
  });
}

export function reminderCopyCs(item: ScheduledReminder, overdue: boolean): { subject: string; lead: string } {
  if (item.kind === "7d") {
    return {
      subject: `MeDipacient: za 7 dní kontrola (${item.title})`,
      lead: `Za týden máte kontrolu (${item.title}). Termín: ${item.visitAt}.`,
    };
  }
  if (item.kind === "24h") {
    return {
      subject: `MeDipacient: zítra kontrola (${item.title})`,
      lead: `Zítra máte kontrolu (${item.title}). Termín: ${item.visitAt}.`,
    };
  }
  return {
    subject: overdue
      ? `MeDipacient: kontrola ${item.visitAt} — nenechte si ujít`
      : `MeDipacient: dnes máte kontrolu (${item.title})`,
    lead: overdue
      ? `V MeDipacient je uložená kontrola na ${item.visitAt} (${item.title}). Pokud už jste ji měli, označte ji jako hotovou.`
      : `Dnes máte kontrolu: ${item.visitAt} (${item.title}).`,
  };
}

/** Re-export month helper for tests without pulling parser internals. */
export { monthsFromIso as addMonthsToIso };
