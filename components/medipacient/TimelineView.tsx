"use client";

import type { TimelineEvent } from "@/lib/medipacient/timelineEngine";
import { LEGAL_DISCLAIMER } from "@/lib/medipacient/patient-summary";

function formatDay(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

const KIND_CS: Record<TimelineEvent["kind"], string> = {
  document: "Zpráva",
  visit: "Kontrola",
  lab: "Laboratoř",
  recommendation: "Doporučení",
  reminder: "Připomínka",
};

export function TimelineView({
  events,
  onOpen,
}: {
  events: TimelineEvent[];
  onOpen?: (documentId: string) => void;
}) {
  if (!events.length) {
    return (
      <p className="mt-6 rounded-2xl border-2 border-dashed border-slate-400 bg-white px-4 py-8 text-center text-lg leading-7 text-slate-800">
        Časová osa je prázdná. Nahrajte lékařskou zprávu a stiskněte <strong>Znovu zpracovat</strong>, pokud už soubor máte.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <ol className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="relative pl-6">
            <span className="absolute left-1 top-4 h-3 w-3 rounded-full bg-[#2D7FF9]" />
            <button
              type="button"
              onClick={() => onOpen?.(event.documentId)}
              className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-4 text-left"
            >
              <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">
                {KIND_CS[event.kind]} · {formatDay(event.dateIso)}
              </p>
              <p className="mt-1 text-xl font-semibold leading-7 text-[#021d33]">{event.title}</p>
              <p className="mt-1 text-lg leading-7 text-slate-800">{event.body}</p>
              {event.trend ? (
                <p className="mt-2 text-base font-semibold text-[#021d33]">Trend: {event.trend}</p>
              ) : null}
              {event.labs?.length ? (
                <ul className="mt-2 space-y-1 text-lg text-slate-800">
                  {event.labs.slice(0, 6).map((lab) => (
                    <li key={`${event.id}-${lab.name}`}>
                      {lab.name} {lab.value} {lab.unit}
                    </li>
                  ))}
                </ul>
              ) : null}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-base leading-6 text-slate-700">{LEGAL_DISCLAIMER}</p>
    </div>
  );
}
