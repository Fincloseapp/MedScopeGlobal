"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { V23Recommendation } from "@/lib/v23/recommendations";

const STORAGE_KEY = "ms_v23_visit_paths";

function recordPath() {
  if (typeof window === "undefined") return [];
  const path = window.location.pathname;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const paths: string[] = raw ? JSON.parse(raw) : [];
    if (!paths.includes(path)) paths.unshift(path);
    const trimmed = paths.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return [path];
  }
}

export function V23PersonalizedFeed() {
  const [items, setItems] = useState<V23Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paths = recordPath();
    fetch("/api/v23/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    })
      .then((r) => r.json())
      .then((data: { items?: V23Recommendation[] }) => {
        setItems(data.items ?? []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="border-y border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm text-slate-500">Načítám doporučení…</p>
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="border-y border-slate-200 bg-gradient-to-b from-sky-50/50 to-white" aria-labelledby="v23-rec-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">AI doporučení</p>
            <h2 id="v23-rec-heading" className="font-display text-2xl font-semibold text-[#021d33]">
              Co číst dál
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.topic}</p>
              <h3 className="mt-1 font-semibold text-[#021d33]">{item.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
              <p className="mt-2 text-xs text-slate-400">{item.reason}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
