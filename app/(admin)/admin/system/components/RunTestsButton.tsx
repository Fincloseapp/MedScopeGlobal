"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RunTestsButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setStatus("Spouštím rychlé v25 testy (link, nav, screenshot, image)…");
    try {
      const res = await fetch("/api/v25/system/run?mode=quick", {
        method: "POST",
        credentials: "same-origin",
        signal: AbortSignal.timeout(90000),
      });
      const text = await res.text();
      let data: { ok?: boolean; persisted?: boolean; error?: string; errors?: string[] };
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        setStatus(
          res.status === 504 || res.status === 408
            ? "Timeout — testy trvaly příliš dlouho. Zkuste znovu nebo spusťte CRON v25-enterprise."
            : `Neočekávaná odpověď serveru (${res.status})`
        );
        return;
      }
      if (res.ok && data.persisted === false) {
        setStatus("Testy doběhly, ale stav se neuložil do Supabase — spusťte npm run db:setup");
      } else if (res.ok) {
        const detail = data.errors?.length ? ` — ${data.errors.slice(0, 2).join("; ")}` : "";
        setStatus(`Hotovo — ${data.ok ? "PASS" : "FAIL"}${detail}`);
      } else {
        setStatus(data.error ?? `Chyba serveru (${res.status})`);
      }
      if (res.ok) window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setStatus(
        msg.includes("timeout") || msg.includes("aborted")
          ? "Timeout — server nestihl doběhnout. Zkuste znovu za chvíli."
          : "Síťová chyba — zkontrolujte přihlášení v /admin/login"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={run} disabled={loading}>
        {loading ? "Běží…" : "Spustit v25 testy"}
      </Button>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </div>
  );
}
