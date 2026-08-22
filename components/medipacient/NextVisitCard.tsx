"use client";

import { buildControlIcs, googleCalendarUrl } from "@/lib/medipacient/control-calendar";
import type { TimelineEvent } from "@/lib/medipacient/timelineEngine";

function formatDay(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function NextVisitCard({
  visit,
  onOpen,
  showCalendar = true,
}: {
  visit: TimelineEvent | null;
  onOpen?: (documentId: string) => void;
  showCalendar?: boolean;
}) {
  if (!visit) {
    return (
      <section className="mt-4 rounded-2xl border-2 border-dashed border-slate-400 bg-white p-4">
        <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Příští kontrola</p>
        <p className="mt-2 text-lg leading-7 text-slate-800">
          Termín kontroly ve zprávách zatím nenašli. Po zpracování se tu objeví datum i kam jít.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border-2 border-[#2D7FF9] bg-white p-4">
      <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Příští kontrola</p>
      <p className="mt-2 text-3xl font-semibold leading-tight text-[#021d33]">{formatDay(visit.dateIso)}</p>
      <p className="mt-1 text-xl font-semibold text-[#021d33]">{visit.title}</p>
      {visit.where ? <p className="mt-1 text-lg text-slate-800">Kam: {visit.where}</p> : null}
      <p className="mt-1 text-lg leading-7 text-slate-800">{visit.body}</p>
      <div className="mt-3 flex flex-col gap-2">
        {onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(visit.documentId)}
            className="min-h-14 rounded-full bg-[#2D7FF9] px-4 text-lg font-semibold text-white"
          >
            Otevřít zprávu
          </button>
        ) : null}
        {showCalendar ? (
          <>
            <button
              type="button"
              onClick={() =>
                downloadIcs(
                  "kontrola-medipacient.ics",
                  buildControlIcs({ date: visit.dateIso, title: visit.title, details: visit.body }),
                )
              }
              className="min-h-14 rounded-full border-2 border-slate-400 bg-white px-4 text-lg font-semibold"
            >
              Přidat do kalendáře
            </button>
            <a
              href={googleCalendarUrl({ date: visit.dateIso, title: visit.title, details: visit.body })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 items-center justify-center rounded-full border-2 border-slate-400 bg-white px-4 text-center text-lg font-semibold"
            >
              Google Kalendář
            </a>
          </>
        ) : null}
      </div>
    </section>
  );
}
