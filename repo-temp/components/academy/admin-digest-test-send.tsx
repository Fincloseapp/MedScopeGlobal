"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminDigestTestSend() {
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function sendTest() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/academy/marketing/test-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(to.trim() ? { to: to.trim() } : {}),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        sent?: boolean;
        mode?: string;
        to?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      if (data.mode === "log") {
        setStatus(`Log-only režim — digest zalogován (cíl: ${data.to}). Nastavte SENDGRID_API_KEY pro odeslání.`);
        return;
      }
      setStatus(data.sent ? `Test odeslán na ${data.to}` : `SendGrid selhal: ${data.error ?? "neznámá chyba"}`);
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <p className="font-medium text-[#021d33]">Test-send digestu</p>
      <p className="mt-1 text-xs text-slate-500">
        Odešle ukázkový týdenní digest přes SendGrid (pokud je klíč nastaven), jinak log-only.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="flex-1 text-xs text-slate-600">
          E-mail příjemce (volitelné)
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="ACADEMY_NEWSLETTER_TO nebo from"
            className="mt-1 w-full min-w-[200px] rounded border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <Button type="button" size="sm" onClick={sendTest} disabled={loading}>
          {loading ? "Odesílám…" : "Odeslat test"}
        </Button>
      </div>
      {status ? <p className="mt-2 text-xs text-slate-600">{status}</p> : null}
    </div>
  );
}
