"use client";

import { useState } from "react";
import { Copy, Square, Volume2 } from "lucide-react";
import { AI_FAILED_CS, LEGAL_DISCLAIMER, type PatientSummary } from "@/lib/medipacient/patient-summary";
import { buildControlIcs, controlEventTitle, googleCalendarUrl } from "@/lib/medipacient/control-calendar";
import { medicationsOf } from "@/lib/medipacient/medications";
import { buildFamilyShareText, copyTextToClipboard } from "@/lib/medipacient/family-share";
import { buildReadAloudText } from "@/lib/medipacient/read-aloud";
import { useMeDipacientReadAloud } from "@/components/medipacient/use-medipacient-read-aloud";
import { RecommendationsCard } from "@/components/medipacient/RecommendationsCard";
import { PlanUpgradeCard } from "@/components/medipacient/PlanUpgradeCard";
import type { Recommendation } from "@/lib/medipacient/medicalParserCZ";
import {
  PATIENT_PDF_FILENAME,
  downloadPatientSummaryPdf,
  openPatientPrintPreview,
} from "@/components/medipacient/medipacient-export";

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
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

export function MeDipacientPatientSummary({
  summary,
  name,
  originalUrl,
  loading,
  extractError,
  reminderSaved,
  recommendations,
  canExportPdf = true,
  onClose,
  onReprocess,
  onOpenOriginal,
}: {
  summary: PatientSummary | null;
  name: string;
  originalUrl?: string | null;
  loading?: boolean;
  extractError?: string | null;
  reminderSaved?: boolean;
  recommendations?: Recommendation[];
  canExportPdf?: boolean;
  onClose: () => void;
  onReprocess?: () => void;
  onOpenOriginal?: () => void;
}) {
  const kontrolaIso = summary?.termin_kontroly.vypoctene_datum ?? null;
  const kontrola = formatDate(kontrolaIso);
  const eventTitle = controlEventTitle(summary?.obor_lekare);
  const calendarDetails = summary?.termin_kontroly.puvodni_text
    ? `Z lékařské zprávy: ${summary.termin_kontroly.puvodni_text}`
    : "Připomínka kontroly z MeDipacient.";
  const legalNote = summary?.pravni_dolozka || LEGAL_DISCLAIMER;
  const leky = summary ? medicationsOf(summary) : [];
  const { speaking, unsupported, speak, stop } = useMeDipacientReadAloud();
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const readAloudText = summary ? buildReadAloudText(summary) : "";

  async function copyForFamily() {
    if (!summary) return;
    const ok = await copyTextToClipboard(buildFamilyShareText(summary, name));
    setCopyState(ok ? "ok" : "fail");
    window.setTimeout(() => setCopyState("idle"), 2500);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#F5F7FA] text-[#021d33] print:static print:h-auto print:bg-white" role="dialog" aria-modal="true" aria-label="Srozumitelný překlad zprávy">
      <div className="flex items-center justify-between border-b-2 border-slate-300 bg-white px-4 py-3 print:hidden">
        <button
          type="button"
          onClick={() => {
            stop();
            onClose();
          }}
          className="min-h-12 text-lg font-semibold text-[#2D7FF9]"
        >
          Zpět
        </button>
        <p className="max-w-[60%] truncate text-base font-semibold">{name}</p>
        <span className="w-10" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 print:overflow-visible print:px-0">
        <div className="mx-auto max-w-lg space-y-4 print:max-w-none">
          {loading ? (
            <div className="rounded-2xl border-2 border-sky-200 bg-white px-4 py-6 text-center">
              <p className="text-xl font-semibold text-[#021d33]">Čteme zprávu…</p>
              <p className="mt-2 text-base leading-7 text-slate-700">
                Obvykle to trvá několik sekund. Okno nechte otevřené — soubor znovu nahrávat nemusíte.
              </p>
            </div>
          ) : null}
          {extractError && !loading ? (
            <div className="rounded-2xl border-2 border-rose-400 bg-rose-50 px-4 py-4">
              <p className="text-xl font-semibold text-rose-950">Zprávu se nepodařilo přečíst</p>
              <p className="mt-2 text-lg leading-7 text-rose-950">{extractError}</p>
            </div>
          ) : null}
          {summary && !loading ? (
            <>
              <div className="flex flex-col gap-2 print:hidden">
                {unsupported ? (
                  <p className="rounded-xl border-2 border-amber-400 bg-amber-50 px-3 py-2 text-base text-amber-950">
                    Čtení nahlas ve vašem prohlížeči nefunguje.
                  </p>
                ) : speaking ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-rose-700 px-4 text-lg font-semibold text-white"
                  >
                    <Square className="h-5 w-5" />
                    Zastavit čtení
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void speak(readAloudText)}
                    disabled={!readAloudText}
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#2D7FF9] px-4 text-lg font-semibold text-white disabled:opacity-60"
                  >
                    <Volume2 className="h-6 w-6" />
                    Přečíst nahlas
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void copyForFamily()}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-slate-400 bg-white px-4 text-lg font-semibold"
                >
                  <Copy className="h-5 w-5" />
                  {copyState === "ok"
                    ? "Zkopírováno"
                    : copyState === "fail"
                      ? "Kopírování se nepovedlo"
                      : "Zkopírovat pro rodinu"}
                </button>
                <p className="text-base leading-6 text-slate-700">
                  Do schránky jde krátký srozumitelný text, ne originál lékařské zprávy.
                </p>
              </div>
              <section className="rounded-2xl border-2 border-slate-300 bg-white p-4">
                <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Obor</p>
                <p className="mt-2 text-2xl font-semibold">{summary.obor_lekare || "Neuvedeno"}</p>
              </section>
              <section className="rounded-2xl border-2 border-[#2D7FF9] bg-white p-4">
                <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Kontrola</p>
                {summary.termin_kontroly.nalezeno && kontrola && kontrolaIso ? (
                  <>
                    <p className="mt-2 text-3xl font-semibold leading-tight text-[#021d33]">{kontrola}</p>
                    {summary.termin_kontroly.puvodni_text ? (
                      <p className="mt-1 text-base text-slate-700">Ve zprávě: {summary.termin_kontroly.puvodni_text}</p>
                    ) : null}
                    {reminderSaved ? (
                      <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-base font-medium text-emerald-950">
                        Termín je na úvodní stránce.
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-col gap-2 print:hidden">
                      <button
                        type="button"
                        onClick={() =>
                          downloadIcs(
                            "kontrola-medipacient.ics",
                            buildControlIcs({ date: kontrolaIso, title: eventTitle, details: calendarDetails }),
                          )
                        }
                        className="min-h-14 rounded-full border-2 border-slate-400 bg-white px-4 text-lg font-semibold"
                      >
                        Přidat do kalendáře
                      </button>
                      <a
                        href={googleCalendarUrl({ date: kontrolaIso, title: eventTitle, details: calendarDetails })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-14 items-center justify-center rounded-full border-2 border-slate-400 bg-white px-4 text-center text-lg font-semibold"
                      >
                        Google Kalendář
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-lg leading-7 text-slate-800">
                    Termín kontroly ve zprávě nenašli. Pokud si nejste jistí, zeptejte se lékaře.
                  </p>
                )}
              </section>
              {leky.length ? (
                <section className="rounded-2xl border-2 border-emerald-400 bg-white p-4" aria-label="Léky">
                  <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Léky</p>
                  <ul className="mt-3 space-y-3">
                    {leky.map((med) => (
                      <li key={`${med.name}-${med.dosage}`} className="text-xl leading-8">
                        <span className="font-semibold">{med.name}</span>
                        {med.dosage ? <span className="mt-0.5 block text-lg text-slate-800">{med.dosage}</span> : null}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-base leading-6 text-slate-700">
                    Užívejte jen tak, jak vám řekl lékař. Tento seznam je orientační.
                  </p>
                </section>
              ) : null}
              <section className="rounded-2xl border-2 border-slate-300 bg-white p-4">
                <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Překlad</p>
                {summary.srozumitelny_preklad ? (
                  <p className="mt-3 text-xl leading-8 text-slate-900 print:text-2xl print:leading-9">{summary.srozumitelny_preklad}</p>
                ) : (
                  <p className="mt-3 text-lg leading-7 text-rose-950">{AI_FAILED_CS}</p>
                )}
              </section>
              <section className="rounded-2xl border-2 border-slate-300 bg-white p-4">
                <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Co dál</p>
                {summary.doporuceny_postup.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-lg leading-7">
                    {summary.doporuceny_postup.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-lg leading-7 text-slate-800">Postup ve zprávě nenašli. Zeptejte se lékaře.</p>
                )}
              </section>
              <RecommendationsCard items={recommendations?.length ? recommendations : summary.recommendations || []} />
              {(summary.lab_values || []).length ? (
                <section className="rounded-2xl border-2 border-slate-300 bg-white p-4">
                  <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Laboratorní hodnoty</p>
                  <ul className="mt-3 space-y-2 text-xl leading-8">
                    {summary.lab_values!.map((lab) => (
                      <li key={`${lab.name}-${lab.raw}`}>
                        <span className="font-semibold">{lab.name}</span> {lab.value} {lab.unit}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section className="rounded-2xl border-2 border-slate-300 bg-white p-4">
                <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Otázky pro lékaře</p>
                {summary.otazky_pro_lekare.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-lg leading-7">
                    {summary.otazky_pro_lekare.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-lg leading-7 text-slate-800">Žádné otázky jsme nesestavili.</p>
                )}
              </section>
            </>
          ) : !loading && !extractError ? (
            <p className="rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-4 text-lg leading-7 text-amber-950">
              {AI_FAILED_CS}
            </p>
          ) : null}
          <p className="rounded-2xl border-2 border-amber-500 bg-amber-50 px-4 py-4 text-lg leading-7 text-amber-950">
            {legalNote} MeDipacient není zdravotnický prostředek.
          </p>
          <div className="flex flex-col gap-2 pb-8 print:hidden">
            {summary && !loading ? (
              <>
                {canExportPdf ? (
                  <>
                    <button
                      type="button"
                      onClick={() => downloadPatientSummaryPdf(summary, name)}
                      className="min-h-14 rounded-full bg-[#2D7FF9] px-4 text-lg font-semibold text-white"
                    >
                      Stáhnout PDF ({PATIENT_PDF_FILENAME})
                    </button>
                    <button
                      type="button"
                      onClick={() => openPatientPrintPreview(summary, name)}
                      className="min-h-14 rounded-full border-2 border-slate-400 bg-white px-4 text-lg font-semibold"
                    >
                      Tisknout velkým písmem
                    </button>
                  </>
                ) : (
                  <PlanUpgradeCard feature="pdfExport" />
                )}
              </>
            ) : null}
            {originalUrl || onOpenOriginal ? (
              <button
                type="button"
                onClick={() => (onOpenOriginal ? onOpenOriginal() : originalUrl && window.open(originalUrl, "_blank", "noopener,noreferrer"))}
                className="min-h-14 rounded-full border-2 border-slate-400 bg-white px-4 text-lg font-semibold"
              >
                Otevřít originál
              </button>
            ) : null}
            {onReprocess ? (
              <button
                type="button"
                onClick={onReprocess}
                className="min-h-14 rounded-full border-2 border-slate-400 bg-white px-4 text-lg font-semibold"
              >
                Znovu zpracovat
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
