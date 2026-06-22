import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getCongressEvents } from "@/lib/queries/congresses";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";

export const metadata: Metadata = {
  title: "Kalendář kongresů",
};

export default async function KongresyKalendarPage() {
  const events = await getCongressEvents();
  const calAds = await getActiveAdsByPlacement("congress_calendar", 1);

  const byMonth = new Map<string, typeof events>();
  for (const ev of events) {
    const key = ev.starts_at
      ? new Date(ev.starts_at).toLocaleDateString("cs-CZ", { year: "numeric", month: "long" })
      : "Bez data";
    const list = byMonth.get(key) ?? [];
    list.push(ev);
    byMonth.set(key, list);
  }

  return (
    <ModulePageShell
      eyebrow="Kalendář"
      title="Timeline kongresů"
      description="Chronologický přehled publikovaných akcí."
      ctaHref="/kongresy/pridat"
      ctaLabel="Přidat akci"
    >
      <AdPlacement ads={calAds} variant="inline" />
      <div className="mt-8 space-y-10">
        {[...byMonth.entries()].map(([month, list]) => (
          <div key={month}>
            <h2 className="font-display text-lg font-semibold text-[#005B96]">{month}</h2>
            <ul className="mt-4 space-y-3 border-l-2 border-[#cfe1f3] pl-6">
              {list.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-[#005B96]" />
                  <Link href={`/kongresy/${ev.slug}`} className="font-semibold text-[#021d33] hover:underline">
                    {ev.title}
                  </Link>
                  <p className="text-xs text-slate-500">{ev.location}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href="/kongresy" className="mt-8 inline-block text-sm text-[#005B96]">
        ← Přehled kongresů
      </Link>
    </ModulePageShell>
  );
}
