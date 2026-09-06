import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { LONGEVITY_MEDIA_KIT } from "@/lib/monetization/revenue-mix";
import { formatCzkListPrice, localizeListedCzk } from "@/lib/i18n/payment-currency";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getRevenueCopy(locale);
  return {
    title: copy.mediaKitTitle,
    description: localizeListedCzk(
      "Native banner od 5 000 Kč, sponzorovaný článek od 15 000 Kč — ViaLongeVita longevity audience.",
      locale
    ),
  };
}

function adOffers(copy: ReturnType<typeof getRevenueCopy>) {
  return [
    {
      title: copy.bannerName,
      description: copy.bannerOfferDesc,
      href: "/inzerce/formular",
    },
    {
      title: copy.sponsoredName,
      description: copy.sponsoredOfferDesc,
      href: "/inzerce/formular",
    },
    {
      title: copy.newsletterName,
      description: copy.newsletterOfferDesc,
      href: "/inzerce/formular",
    },
    {
      title: copy.cosmeticsName,
      description: copy.cosmeticsOfferDesc,
      href: "/firmy/kosmetika",
    },
    { title: copy.priceListName, description: copy.priceListDesc, href: "/inzerce/cenik" },
  ];
}

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
            {formatCzkListPrice(priceById["native-banner"] ?? 5000, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#cfe1f3] bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">{copy.sponsoredName}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-[#021d33]">
            {formatCzkListPrice(priceById["sponsored-article"] ?? 15000, locale)}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adOffers(copy).map((o) => (
          <FeatureCard
            key={o.title}
            title={o.title}
            description={o.description}
            href={localizePublicHref(o.href, locale)}
          />
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">
        <Link href="/inzerce/cenik" className="font-semibold text-[#005B96] hover:underline">
          {copy.priceListCta} →
        </Link>
        {" · "}
        <Link href="/inzerce/formular" className="font-semibold text-[#005B96] hover:underline">
          {copy.mediaKitCta} →
        </Link>
      </p>
    </ModulePageShell>
  );
}
