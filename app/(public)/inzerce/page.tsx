import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { getMediaKitCopy } from "@/lib/i18n/media-kit-copy";
import { LONGEVITY_MEDIA_KIT } from "@/lib/monetization/revenue-mix";
import { PRICING_CATALOG } from "@/lib/ads/pricing";
import { formatCzkListPrice, localizeListedCzk } from "@/lib/i18n/payment-currency";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getInzerceCenikCopy } from "@/lib/i18n/inzerce-cenik-copy";

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

const FORMAT_IDS = [
  "native-banner",
  "sponsored-article",
  "newsletter-mention",
  "cosmetics-hub",
] as const;

export default async function InzercePage() {
  const locale = await getServerLocale();
  const copy = getRevenueCopy(locale);
  const kit = getMediaKitCopy(locale);
  const cenik = getInzerceCenikCopy(locale);
  const priceById = Object.fromEntries(LONGEVITY_MEDIA_KIT.map((item) => [item.id, item.priceCzk]));
  const formHref = localizePublicHref("/inzerce/formular", locale);
  const cenikHref = localizePublicHref("/inzerce/cenik", locale);

  const intervalLabel = (interval: (typeof LONGEVITY_MEDIA_KIT)[number]["interval"]) => {
    if (interval === "month") return cenik.perMonth;
    if (interval === "issue") return kit.perIssue;
    return "";
  };

  return (
    <ModulePageShell
      eyebrow={copy.mediaKitEyebrow}
      title={copy.mediaKitTitle}
      description={copy.mediaKitLead}
      ctaHref={formHref}
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

      <section className="mb-10 rounded-2xl border border-[#cfe1f3] bg-white px-5 py-6 sm:px-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          {kit.letterEyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">{kit.letterTitle}</h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
          {kit.letterBody.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{kit.audienceTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{kit.audienceLead}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {kit.audienceItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#cfe1f3] bg-white px-4 py-4">
              <p className="text-sm font-semibold text-[#021d33]">{item.label}</p>
              <p className="mt-1 text-sm text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-5 py-5">
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{kit.digitalTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">{kit.digitalBody}</p>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{kit.formatsTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{kit.formatsLead}</p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#cfe1f3] bg-white">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-[#f0f7ff] text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{kit.formatCol}</th>
                <th className="px-4 py-3 font-semibold">{kit.placeCol}</th>
                <th className="px-4 py-3 font-semibold">{kit.priceCol}</th>
                <th className="px-4 py-3 font-semibold">{kit.noteCol}</th>
              </tr>
            </thead>
            <tbody>
              {kit.formats.map((row, index) => {
                const item = LONGEVITY_MEDIA_KIT.find((offer) => offer.id === FORMAT_IDS[index]);
                const extra = item ? intervalLabel(item.interval) : "";
                return (
                  <tr key={row.name} className="border-t border-[#e6eef6]">
                    <td className="px-4 py-3 font-medium text-[#021d33]">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.place}</td>
                    <td className="px-4 py-3 font-semibold text-[#005B96]">
                      {item
                        ? `${formatCzkListPrice(item.priceCzk, locale)}${extra ? ` ${extra}` : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

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

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{kit.packagesTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{kit.packagesLead}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {PRICING_CATALOG.packages.map((pack) => (
            <div key={pack.id} className="rounded-2xl border border-[#cfe1f3] bg-white px-4 py-4">
              <p className="text-sm font-semibold text-[#021d33]">
                {cenik.catalog[pack.id] ?? pack.label}
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-[#005B96]">
                {cenik.from} {formatCzkListPrice(pack.from, locale)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[#cfe1f3] bg-white px-5 py-5">
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{kit.cleanTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">{kit.cleanBody}</p>
      </section>

      <section className="mt-10 rounded-2xl border border-[#005B96]/20 bg-[#f0f7ff] px-5 py-6">
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{kit.contactTitle}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">{kit.contactBody}</p>
        <p className="mt-3 text-sm font-semibold text-[#005B96]">
          <a href={`mailto:${kit.contactEmail}`}>{kit.contactEmail}</a>
        </p>
        <p className="mt-4 text-sm">
          <Link href={formHref} className="font-semibold text-[#005B96] hover:underline">
            {kit.contactForm} →
          </Link>
          {" · "}
          <Link href={cenikHref} className="font-semibold text-[#005B96] hover:underline">
            {kit.rateCard} →
          </Link>
        </p>
      </section>

      <p className="mt-8 text-sm text-slate-600">
        <Link href={cenikHref} className="font-semibold text-[#005B96] hover:underline">
          {copy.priceListCta} →
        </Link>
        {" · "}
        <Link href={formHref} className="font-semibold text-[#005B96] hover:underline">
          {copy.mediaKitCta} →
        </Link>
      </p>
    </ModulePageShell>
  );
}
