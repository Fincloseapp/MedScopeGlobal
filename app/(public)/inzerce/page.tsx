import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { LONGEVITY_MEDIA_KIT } from "@/lib/monetization/revenue-mix";
import { formatCzk } from "@/lib/ads/pricing";
import { getServerLocale } from "@/lib/i18n/server-locale";

export const metadata: Metadata = {
  title: "Inzerce a reklama",
  description:
    "Native banner od 5 000 Kč, sponzorovaný článek od 15 000 Kč — ViaLongeVita longevity audience.",
};

const AD_OFFERS = [
  { title: "Native banner", description: "Homepage a články — 5 000 Kč / měsíc.", href: "/inzerce/formular" },
  { title: "Sponzorovaný článek", description: "Označený partnerský text — 15 000 Kč.", href: "/inzerce/formular" },
  { title: "Newsletter", description: "Mention v týdenním briefu — od 3 500 Kč.", href: "/inzerce/formular" },
  { title: "Ceník", description: "Kompletní sazebník bannerů a balíčků.", href: "/inzerce/cenik" },
];

export default async function InzercePage() {
  const locale = await getServerLocale();
  const copy = getRevenueCopy(locale);
  const priceById = Object.fromEntries(LONGEVITY_MEDIA_KIT.map((item) => [item.id, item.priceCzk]));

  return (
    <ModulePageShell
      eyebrow={copy.mediaKitEyebrow}
      title={copy.mediaKitTitle}
      description={copy.mediaKitLead}
      ctaHref="/inzerce/formular"
      ctaLabel={copy.mediaKitCta}
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#cfe1f3] bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">{copy.mediaKitReach}</p>
          <p className="mt-1 text-sm text-slate-600">{copy.mediaKitAudience}</p>
        </div>
        <div className="rounded-2xl border border-[#cfe1f3] bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">{copy.bannerName}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-[#021d33]">
            {formatCzk(priceById["native-banner"] ?? 5000)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#cfe1f3] bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">{copy.sponsoredName}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-[#021d33]">
            {formatCzk(priceById["sponsored-article"] ?? 15000)}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AD_OFFERS.map((o) => (
          <FeatureCard key={o.title} title={o.title} description={o.description} href={o.href} />
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">
        <Link href="/inzerce/cenik" className="font-semibold text-[#005B96] hover:underline">
          Kompletní ceník →
        </Link>
        {" · "}
        <Link href="/inzerce/formular" className="font-semibold text-[#005B96] hover:underline">
          {copy.mediaKitCta} →
        </Link>
      </p>
    </ModulePageShell>
  );
}
