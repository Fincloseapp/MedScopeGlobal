"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type RunMode = "suite" | "quick";

export function TestRunButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<RunMode | null>(null);

  async function run(mode: RunMode) {
    setLoading(mode);
    setStatus(
      mode === "suite"
        ? "Spouštím v25.4 test suite (routing, links, nav, API, ads, veřejnost, odborná, CLK)…"
        : "Spouštím rychlé v25 testy…"
    );
    try {
      const res = await fetch(`/api/v25/system/run?mode=${mode}`, {
        method: "POST",
        credentials: "same-origin",
        signal: AbortSignal.timeout(120000),
      });
      const text = await res.text();
      let data: { ok?: boolean; persisted?: boolean; error?: string; errors?: string[] };
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        setStatus(
          res.status === 504 || res.status === 408
            ? "Timeout — testy trvaly příliš dlouho."
            : `Neočekávaná odpověď serveru (${res.status})`
        );
        return;
      }
      if (res.ok && data.persisted === false) {
        setStatus("Testy doběhly, ale stav se neuložil — spusťte npm run db:setup");
      } else if (res.ok) {
        const fails = data.errors?.length ? ` — ${data.errors.slice(0, 3).join("; ")}` : "";
        setStatus(`Hotovo — ${data.ok ? "PASS" : "FAIL"}${fails}`);
      } else {
        setStatus(data.error ?? `Chyba serveru (${res.status})`);
      }
      if (res.ok) window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setStatus(
        msg.includes("timeout") || msg.includes("aborted")
          ? "Timeout — server nestihl doběhnout."
          : "Síťová chyba — zkontrolujte přihlášení v /admin/login"
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => run("suite")} disabled={loading !== null}>
        {loading === "suite" ? "Běží suite…" : "Spustit test suite"}
      </Button>
      <Button variant="outline" onClick={() => run("quick")} disabled={loading !== null}>
        {loading === "quick" ? "Běží quick…" : "Rychlé v25 testy"}
      </Button>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </div>
  );
}
