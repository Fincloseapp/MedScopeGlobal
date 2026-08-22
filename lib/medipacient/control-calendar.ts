export function toCalendarDay(iso: string): string {
  return iso.replace(/-/g, "");
}

export function nextCalendarDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return dt.toISOString().slice(0, 10).replace(/-/g, "");
}

export function controlEventTitle(obor?: string | null): string {
  const specialty = (obor || "").trim();
  return specialty ? `Kontrola · ${specialty}` : "Kontrola u lékaře";
}

export function buildControlIcs(opts: { date: string; title: string; details?: string }): string {
  const start = toCalendarDay(opts.date);
  const end = nextCalendarDay(opts.date);
  const summary = opts.title.replace(/[\r\n]+/g, " ").slice(0, 120);
  const desc = (opts.details || "").replace(/[\r\n]+/g, "\\n").slice(0, 400);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MedScopeGlobal//MeDipacient//CS",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:medipacient-${start}@medscopeglobal.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${summary}`,
    desc ? `DESCRIPTION:${desc}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .filter((line) => line !== null)
    .join("\r\n");
}

export function googleCalendarUrl(opts: { date: string; title: string; details?: string }): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toCalendarDay(opts.date)}/${nextCalendarDay(opts.date)}`,
    details: opts.details || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
