import type { MedicalEvent } from "./types";
import { siteConfig } from "./site";
function stamp(date: string) { return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n"); }
export function createEventIcs(event: MedicalEvent) {
  const url = `${siteConfig.url}/events/${event.slug}`;
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MedScopeGlobal//Events//CS", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT", `UID:${event.id}@medscopeglobal.com`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(event.startsAt)}`, `DTEND:${stamp(event.endsAt)}`, `SUMMARY:${escapeIcs(event.title)}`, `DESCRIPTION:${escapeIcs(event.description)}`, `LOCATION:${escapeIcs(event.venue || event.format)}`, `URL:${url}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
