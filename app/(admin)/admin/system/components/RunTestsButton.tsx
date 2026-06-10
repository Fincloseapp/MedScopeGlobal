"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RunTestsButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setStatus("Spouštím v25 enterprise pipeline…");
    try {
      const res = await fetch("/api/v25/system/run", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok && data.persisted === false) {
        setStatus("Testy doběhly, ale stav se neuložil do Supabase — spusťte npm run db:setup");
      } else {
        setStatus(res.ok ? `Hotovo — ${data.ok ? "PASS" : "FAIL"}` : data.error ?? "Chyba");
      }
      if (res.ok) window.location.reload();
    } catch {
      setStatus("Síťová chyba");
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
