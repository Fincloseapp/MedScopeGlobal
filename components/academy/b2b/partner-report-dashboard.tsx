"use client";

import { useMemo, useState } from "react";
import type { PartnerInstitution, ReportPeriod } from "@/types/academy-b2b";

type Props = {
  partners: PartnerInstitution[];
  initialPartnerId?: string;
};

export function PartnerReportDashboard({ partners, initialPartnerId }: Props) {
  const [partnerId, setPartnerId] = useState(
    initialPartnerId ?? partners[0]?.id ?? ""
  );
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const selected = useMemo(
    () => partners.find((p) => p.id === partnerId) ?? null,
    [partners, partnerId]
  );

  async function download() {
    if (!partnerId) return;
    setBusy(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        partner_id: partnerId,
        period,
        format,
      });
      const res = await fetch(`/api/academy/b2b/partners/reports?${qs.toString()}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? `Chyba exportu (${res.status})`);
        return;
      }

      const countHeader = res.headers.get("X-Report-Row-Count");
      if (countHeader) setPreviewCount(Number(countHeader));

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="?([^"]+)"?/.exec(disposition);
      const filename =
        match?.[1] ??
        `clk-export-${period}.${format === "xlsx" ? "xls" : "csv"}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Síťová chyba při exportu");
    } finally {
      setBusy(false);
    }
  }

  if (!partners.length) {
    return (
      <div className="border border-slate-200 px-5 py-8 text-sm text-slate-600">
        Nemáte přiřazenou partnerskou instituci. Kontaktujte MedScope admina.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 bg-white px-6 py-8">
      <header className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          B2B reporting
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-[#021d33]">
          Export pro ČLK
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Měsíční a kvartální přehled absolventů akreditovaných kurzů — přesně ve
          sloupcích pro hromadný upload do portálu České lékařské komory.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-500">Instituce</span>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-[#021d33]"
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-slate-500">Období</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-[#021d33]"
          >
            <option value="monthly">Měsíční</option>
            <option value="quarterly">Kvartální</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-slate-500">Formát</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "csv" | "xlsx")}
            className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-[#021d33]"
          >
            <option value="csv">CSV (UTF-8)</option>
            <option value="xlsx">Excel (.xls)</option>
          </select>
        </label>
      </div>

      <ul className="mt-6 space-y-1 text-xs text-slate-500">
        <li>First Name · Last Name · CLK ID</li>
        <li>Course Title · Accreditation Number · Completion Date</li>
      </ul>

      {selected ? (
        <p className="mt-4 text-sm text-slate-600">
          Export pro <span className="text-[#021d33]">{selected.name}</span>
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void download()}
        disabled={busy || !partnerId}
        className="mt-6 bg-[#005B96] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#004a7a] disabled:opacity-50"
      >
        {busy ? "Generuji…" : "Stáhnout report"}
      </button>

      {previewCount != null ? (
        <p className="mt-3 text-sm text-slate-600">
          Poslední export: {previewCount} záznamů
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
