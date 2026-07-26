"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunImageBackfillButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function run() {
    setLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const res = await fetch("/api/v25/images/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxGenerate: 24 }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        detail?: string;
        report?: { assigned?: number; generated?: number; failed?: number; missingBefore?: number };
      };
      if (!res.ok) throw new Error(data.error ?? "Chyba");
      const assigned = data.report?.assigned ?? 0;
      const failed = data.report?.failed ?? 0;
      const generated = data.report?.generated ?? 0;
      setIsError(!data.ok || (assigned === 0 && failed > 0));
      setMessage(
        data.detail ??
          `OK — ${assigned} přiřazeno, ${generated} vygenerováno, ${failed} selhalo`
      );
      router.refresh();
    } catch (e) {
      setIsError(true);
      setMessage(e instanceof Error ? e.message : "Selhalo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.refresh()}
          disabled={loading}
          className="rounded-full border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Obnovit
        </button>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Doplňuji…" : "Automatické doplnění obrázků"}
        </button>
      </div>
      {message ? (
        <span className={`max-w-md text-right text-sm ${isError ? "text-red-700" : "text-muted-foreground"}`}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
