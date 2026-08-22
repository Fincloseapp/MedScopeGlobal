export type ControlReminderStatus = "open" | "done" | "dismissed";

export type ControlReminder = {
  dueAt: string;
  status: ControlReminderStatus;
  emailSentOn?: string | null;
};

export function dueDateFromSummary(summary: {
  termin_kontroly?: { vypoctene_datum?: string | null };
} | null | undefined): string | null {
  const due = summary?.termin_kontroly?.vypoctene_datum;
  return due && /^\d{4}-\d{2}-\d{2}/.test(due) ? due.slice(0, 10) : null;
}

export function mergeControlReminder(
  existing: ControlReminder | undefined,
  dueAt: string | null,
): ControlReminder | undefined {
  if (!dueAt) return existing;
  if (!existing) return { dueAt, status: "open", emailSentOn: null };
  if (existing.dueAt === dueAt) return existing;
  if (existing.status === "open") {
    return { ...existing, dueAt, emailSentOn: null };
  }
  return existing;
}

export function isReminderDue(dueAt: string, today: string): boolean {
  return Boolean(dueAt) && dueAt.slice(0, 10) <= today.slice(0, 10);
}

/** Send once when the control is due or overdue — daily cron is the checker, not daily mail. */
export function shouldSendReminderEmail(reminder: ControlReminder, today: string): boolean {
  return reminder.status === "open" && isReminderDue(reminder.dueAt, today) && !reminder.emailSentOn;
}

export function formatControlDayCs(iso: string): string {
  const day = iso.slice(0, 10);
  const d = new Date(`${day}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

export function pragueToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function buildControlReminderCopy(opts: {
  title: string;
  dueAt: string;
  overdue: boolean;
  appUrl: string;
  disclaimer: string;
}): { subject: string; html: string; text: string } {
  const when = formatControlDayCs(opts.dueAt);
  const subject = opts.overdue
    ? `MeDipacient: kontrola ${when} — nenechte si ujít`
    : `MeDipacient: dnes máte kontrolu (${when})`;
  const lead = opts.overdue
    ? `V MeDipacient je uložená kontrola na ${when} (${opts.title}). Pokud už jste ji měli, v aplikaci ji označte jako hotovou.`
    : `Dnes máte kontrolu: ${when} (${opts.title}).`;
  const text = [
    lead,
    "",
    `Otevřít aplikaci: ${opts.appUrl}`,
    "",
    opts.disclaimer,
    "MeDipacient není zdravotnický prostředek.",
  ].join("\n");
  const html = `<p style="font-size:18px;line-height:1.5">${lead}</p>
<p><a href="${opts.appUrl}" style="display:inline-block;padding:12px 20px;background:#2D7FF9;color:#fff;text-decoration:none;border-radius:999px;font-size:18px">Otevřít MeDipacient</a></p>
<p style="font-size:14px;color:#334155">${opts.disclaimer} MeDipacient není zdravotnický prostředek.</p>`;
  return { subject, html, text };
}
