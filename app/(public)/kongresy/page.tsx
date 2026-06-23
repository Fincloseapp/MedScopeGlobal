import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getUpcomingCongresses } from "@/lib/queries/congresses";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";

export const metadata: Metadata = {
  title: "Kongresy a školení",
  description: "Kalendář odborných akcí, kongresů a školení.",
};

export default async function KongresyPage() {
  const events = await getUpcomingCongresses(12);
  const topAds = await getActiveAdsByPlacement("congress_top", 1);

  return (
    <ModulePageShell
      eyebrow="Kongresy"
      title="Kongresy a školení"
      description="Přehled nadcházejících akcí z českých a evropských zdrojů — s AI extrakcí detailů při přidání."
      ctaHref="/kongresy/kalendar"
      ctaLabel="Kalendář"
    >
      <AdPlacement ads={topAds} variant="banner" />
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/kongresy/kalendar" className="rounded-full border border-[#8dc4ea] px-4 py-2 text-[#005B96] font-semibold">
          Kalendář
        </Link>
        <Link href="/kongresy/pridat" className="rounded-full bg-[#005B96] px-4 py-2 text-white font-semibold">
          Přidat akci
        </Link>
      </div>
      <div className="mt-8 space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-600">Zatím žádné publikované akce.</p>
        ) : (
          events.map((ev) => (
            <Link
              key={ev.id}
              href={`/kongresy/${ev.slug}`}
              className="block rounded-2xl border border-[#cfe1f3] bg-white p-5 hover:shadow-md"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-[#021d33]">{ev.title}</h3>
                {ev.starts_at ? (
                  <time className="text-xs text-[#005B96] font-semibold">
                    {new Date(ev.starts_at).toLocaleDateString("cs-CZ")}
                  </time>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">{[ev.location, ev.organizer].filter(Boolean).join(" · ")}</p>
              {ev.summary ? <p className="mt-2 text-sm text-slate-600 line-clamp-2">{ev.summary}</p> : null}
            </Link>
          ))
        )}
      </div>
    </ModulePageShell>
  );
}
