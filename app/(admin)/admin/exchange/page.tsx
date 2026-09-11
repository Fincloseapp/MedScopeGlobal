"use client";

import { useEffect, useState } from "react";

type Row = { id: string; slug: string; title: string; kind: string; status: string };

export default function AdminExchangePage() {
  const [items, setItems] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/exchange/admin/approve");
    if (!res.ok) {
      setError("Forbidden or unavailable");
      return;
    }
    const json = (await res.json()) as { items?: Row[] };
    setItems(json.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(id: string, decision: "approved" | "rejected") {
    await fetch("/api/exchange/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: id, decision }),
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold">B2B Exchange — schválení</h1>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">{item.title}</p>
            <p className="text-xs text-slate-500">
              {item.kind} · {item.slug} · {item.status}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void decide(item.id, "approved")}
                className="rounded-full bg-[#005B96] px-3 py-1 text-xs font-semibold text-white"
              >
                Schválit
              </button>
              <button
                type="button"
                onClick={() => void decide(item.id, "rejected")}
                className="rounded-full border px-3 py-1 text-xs"
              >
                Zamítnout
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
