"use client";

import { useState } from "react";
import { adminReviewClkForm } from "@/lib/actions/clk-verification";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ClkVerificationRow = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  clk_number: string;
  status: string;
  method: string;
  verified_at: string | null;
  updated_at: string;
  audit_log?: unknown;
};

function statusClass(status: string) {
  switch (status) {
    case "verified":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "manual_review":
    case "pending":
      return "bg-amber-100 text-amber-900";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function ClkVerificationTable({ rows, source }: { rows: ClkVerificationRow[]; source: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function review(id: string, decision: "verified" | "rejected") {
    setPendingId(id);
    setMessage(null);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("decision", decision);
    const res = await adminReviewClkForm(fd);
    setPendingId(null);
    if (res.error) setMessage(res.error);
    else {
      setMessage(decision === "verified" ? "Schváleno." : "Zamítnuto.");
      window.location.reload();
    }
  }

  if (!rows.length) {
    return (
      <p className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
        Zatím žádné žádosti o ověření ČLK. Zdroj: {source}.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Uživatel</th>
              <th className="px-4 py-3 font-medium">ČLK číslo</th>
              <th className="px-4 py-3 font-medium">Stav</th>
              <th className="px-4 py-3 font-medium">Metoda</th>
              <th className="px-4 py-3 font-medium">Aktualizováno</th>
              <th className="px-4 py-3 font-medium">Akce</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{row.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{row.email ?? row.user_id}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{row.clk_number}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                      statusClass(row.status)
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 uppercase text-xs">{row.method}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  {new Date(row.updated_at).toLocaleString("cs-CZ")}
                  {row.verified_at ? (
                    <p className="text-muted-foreground">
                      ověřeno {new Date(row.verified_at).toLocaleDateString("cs-CZ")}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {row.status === "verified" || row.status === "rejected" ? (
                    <span className="text-xs text-muted-foreground">Uzavřeno</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={pendingId === row.id}
                        onClick={() => review(row.id, "verified")}
                      >
                        Schválit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendingId === row.id}
                        onClick={() => review(row.id, "rejected")}
                      >
                        Zamítnout
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
