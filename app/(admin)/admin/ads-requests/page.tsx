"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  company: string;
  email: string;
  status: string;
  decision?: string | null;
  price?: number | null;
  ad_text?: string | null;
  banner_url?: string | null;
  variable_symbol?: string | null;
  editorial_review?: {
    recommendation?: string;
    legal?: { verdict: string; notes: string[] };
    harm?: { verdict: string; notes: string[] };
    diplomatic?: { verdict: string; notes: string[] };
  } | null;
};

export default function AdminAdsRequestsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/ads-requests", { credentials: "same-origin" });
    if (!res.ok) return;
    const body = (await res.json()) as { rows?: Row[] };
    setRows(body.rows ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(id: string, decision: "allowed" | "denied", markPaid = false) {
    setBusy(id);
    await fetch("/api/admin/ads-requests/decide", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        decision,
        markPaid,
        reason: decision === "denied" ? "Nesplňuje právní / bezpečnostní / diplomatická pravidla." : undefined,
      }),
    });
    await load();
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">B2B žádosti o reklamu</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Tři autonomní editoři (právní, bezpečnost, diplomatický tón) běží hned po odeslání.
          Tady zaznamenáte povoleno / nepovoleno. Po povolení firma dostane Stripe i QR s VS.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Firma</th>
              <th className="px-3 py-2 text-left">Editoři</th>
              <th className="px-3 py-2 text-left">Stav</th>
              <th className="px-3 py-2 text-right">Kč</th>
              <th className="px-3 py-2 text-left">Akce</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t align-top">
                <td className="px-3 py-2">
                  <p className="font-medium">{row.company}</p>
                  <p className="text-xs text-slate-500">{row.email}</p>
                  {row.variable_symbol ? <p className="text-xs">VS {row.variable_symbol}</p> : null}
                  {row.banner_url ? (
                    <a href={row.banner_url} className="text-xs text-[#005B96]" target="_blank" rel="noreferrer">
                      vizuál
                    </a>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-600">{row.ad_text?.slice(0, 160)}</p>
                </td>
                <td className="px-3 py-2 text-xs">
                  <p>právní: {row.editorial_review?.legal?.verdict ?? "—"}</p>
                  <p>bezpečnost: {row.editorial_review?.harm?.verdict ?? "—"}</p>
                  <p>diplomatický: {row.editorial_review?.diplomatic?.verdict ?? "—"}</p>
                  <p>doporučení: {row.editorial_review?.recommendation ?? "—"}</p>
                </td>
                <td className="px-3 py-2">
                  {row.status}
                  {row.decision ? ` / ${row.decision}` : ""}
                </td>
                <td className="px-3 py-2 text-right">{Number(row.price ?? 0).toLocaleString("cs-CZ")}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      disabled={busy === row.id}
                      onClick={() => void decide(row.id, "allowed")}
                    >
                      Povolena
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === row.id}
                      onClick={() => void decide(row.id, "denied")}
                    >
                      Nepovolena
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy === row.id}
                      onClick={() => void decide(row.id, "allowed", true)}
                    >
                      Převod došel — aktivovat
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
