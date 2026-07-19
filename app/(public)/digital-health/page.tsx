import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AdPlacement } from "@/components/ads/ad-placement";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { getV22DigitalHealthList } from "@/lib/v22/digital-health/query";
import { V22_DIGITAL_HEALTH_SOURCES, TIER_LABELS } from "@/lib/v22/digital-health/sources";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Digitální zdravotnictví",
  description:
    "Odborný magazín o eHealth, telemedicíně, AI a digitální transformaci — české, evropské a globální zdroje.",
};

export default async function DigitalHealthPage() {
  const [articles, topAds, midAds] = await Promise.all([
    getV22DigitalHealthList(8),
    getActiveAdsByPlacement("digital_health_top", 1),
    getActiveAdsByPlacement("digital_health_mid", 1),
  ]);

  return (
    <ModulePageShell
      eyebrow="Digitální zdravotnictví"
      title="Digitální zdravotnictví"
      description="Profesionální odborné články z MZČR, eZdraví, SÚKL, WHO, EMA, NIH a dalších ověřených zdrojů."
      ctaHref="/digital-health/ai-asistent"
      ctaLabel="AI asistent"
    >
      <AdPlacement ads={topAds} variant="banner" />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href="/digital-health/novinky" prefetch className="rounded-full bg-primary px-3 py-1 text-white">
          Novinky
        </Link>
        <Link
          href="/digital-health/legislativa"
          prefetch
          className="rounded-full border border-primary/30 px-3 py-1 text-primary"
        >
          Legislativa
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Monitorované zdroje</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["cz", "eu", "us", "global"] as const).map((tier) => (
            <div key={tier}>
              <p className="text-[10px] font-semibold uppercase text-slate-500">{TIER_LABELS[tier]}</p>
              <p className="mt-1 text-xs text-slate-600">
                {V22_DIGITAL_HEALTH_SOURCES.filter((s) => s.tier === tier)
                  .map((s) => s.name)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AdPlacement ads={midAds} variant="inline" />

      <div className="grid gap-6 sm:grid-cols-2">
        {articles.map((item) => (
          <Link
            key={item.id}
            href={`/digital-health/${item.slug}`}
            prefetch
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] bg-slate-100">
              <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="50vw" loading="lazy" />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.topic}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{item.summaryCs}</p>
              <p className="mt-2 text-xs text-slate-400">{item.publishedDateLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </ModulePageShell>
  );
}
