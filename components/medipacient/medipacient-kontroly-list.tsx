"use client";

import { buildControlIcs, googleCalendarUrl } from "@/lib/medipacient/control-calendar";
import type { UpcomingControl } from "@/components/medipacient/use-medipacient-reminders";

function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function MeDipacientKontrolyList({
  items,
  onOpen,
  onDone,
  onDismiss,
}: {
  items: UpcomingControl[];
  onOpen: (documentId: string) => void;
  onDone: (documentId: string) => void;
  onDismiss: (documentId: string) => void;
}) {
  if (!items.length) return null;
  return (
    <section className="mt-6" aria-label="Kontroly">
      <h2 className="text-xl font-semibold text-[#021d33]">Kontroly</h2>
      <p className="mt-1 text-base leading-6 text-slate-700">Termíny ze zpráv. Označte hotovo, nebo skryjte.</p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={`${item.documentId}-${item.dueAt}`} className="rounded-2xl border-2 border-[#021d33]/15 bg-white p-4">
            <button type="button" onClick={() => onOpen(item.documentId)} className="w-full text-left">
              <p className="text-base font-semibold text-[#2D7FF9]">
                {item.today ? "Dnes" : item.overdue ? "Po termínu" : "Blíží se"}
              </p>
              <p className="mt-1 text-2xl font-semibold leading-tight text-[#021d33]">{item.dueLabel}</p>
              <p className="mt-1 text-lg font-medium text-slate-900">{item.title}</p>
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onDone(item.documentId)}
                className="min-h-12 rounded-full bg-[#021d33] px-3 text-base font-semibold text-white"
              >
                Hotovo
              </button>
              <button
                type="button"
                onClick={() => onDismiss(item.documentId)}
                className="min-h-12 rounded-full border-2 border-slate-300 bg-white px-3 text-base font-semibold text-slate-900"
              >
                Skrýt
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadIcs(
                  "kontrola-medipacient.ics",
                  buildControlIcs({ date: item.dueAt, title: item.title, details: `Zpráva: ${item.name}` }),
                )
              }
              className="mt-2 min-h-12 w-full rounded-full border-2 border-slate-300 bg-white text-base font-semibold text-slate-900"
            >
              Přidat do kalendáře
            </button>
            <a
              href={googleCalendarUrl({ date: item.dueAt, title: item.title, details: `Zpráva: ${item.name}` })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex min-h-12 items-center justify-center rounded-full text-base font-semibold text-[#2D7FF9] underline"
            >
              Google Kalendář
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
