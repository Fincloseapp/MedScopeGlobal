import { NextResponse } from "next/server";

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "MedScopeGlobal event";
  const summary = searchParams.get("summary") ?? "Clinical event from MedScopeGlobal";
  const start = searchParams.get("start") ?? new Date().toISOString();
  const end = searchParams.get("end") ?? new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const location = searchParams.get("location") ?? "Online";

  const startDate = new Date(start);
  const endDate = new Date(end);
  const uid = `${Date.now()}@medscopeglobal.com`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MedScopeGlobal//Medical Intelligence//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${startDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(summary)}`,
    `LOCATION:${escapeIcs(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60)}.ics"`,
    },
  });
}
