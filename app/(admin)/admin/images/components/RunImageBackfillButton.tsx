"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunImageBackfillButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v25/images/run", { method: "POST", body: JSON.stringify({ maxGenerate: 24 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chyba");
      setMessage(data.detail ?? `OK — ${data.report?.assigned ?? 0} přiřazeno`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Selhalo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Doplňuji…" : "Automatické doplnění obrázků"}
      </button>
      {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
    </div>
  );
}
