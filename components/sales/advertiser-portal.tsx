"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PortalPayload = {
  company?: string;
  packageName?: string;
  status?: string;
  monthly?: string;
  paidMonths?: number;
  paidTotal?: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  checkoutUrl?: string | null;
  landing?: string;
  invoices?: Array<{ number: string; status: string; amount: string; vs: string; paidAt: string | null }>;
  inquiries?: Array<{ status: string; sender: string; createdAt: string }>;
  error?: string;
};

export function AdvertiserPortal({ token }: { token: string }) {
  const [data, setData] = useState<PortalPayload | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/sales/portal?token=${encodeURIComponent(token)}`);
      setData((await res.json()) as PortalPayload);
    })();
  }, [token]);

  if (!data) return <p className="text-sm text-slate-600">Načítám portál…</p>;
  if (data.error) return <p className="text-sm text-red-700">{data.error}</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Portál inzerenta</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-[#021d33]">{data.company}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {data.packageName} · {data.monthly} · stav {data.status} · zaplaceno {data.paidMonths} měs. ({data.paidTotal})
        </p>
        <p className="text-xs text-slate-500">
          Období {data.periodStart ?? "—"} – {data.periodEnd ?? "—"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.checkoutUrl ? (
            <Button asChild>
              <a href={data.checkoutUrl}>Zaplatit paušál kartou</a>
            </Button>
          ) : null}
          {data.landing ? (
            <Button variant="outline" asChild>
              <Link href={data.landing}>Veřejný profil</Link>
            </Button>
          ) : null}
        </div>
      </div>
      <section>
        <h2 className="font-display text-xl font-semibold">Faktury</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(data.invoices ?? []).map((row) => (
            <li key={row.number} className="rounded-xl border bg-white px-4 py-3">
              {row.number} · {row.amount} · VS {row.vs} · {row.status}
              {row.paidAt ? ` · uhrazeno ${new Date(row.paidAt).toLocaleDateString("cs-CZ")}` : ""}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Poptávky</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(data.inquiries ?? []).map((row, i) => (
            <li key={`${row.sender}-${i}`} className="rounded-xl border bg-white px-4 py-3">
              {row.sender} · {row.status} · {new Date(row.createdAt).toLocaleString("cs-CZ")}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
