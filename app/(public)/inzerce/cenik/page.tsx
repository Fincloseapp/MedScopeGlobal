import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PRICING_CATALOG } from "@/lib/ads/pricing";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getInzerceCenikCopy } from "@/lib/i18n/inzerce-cenik-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getInzerceCenikCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/inzerce/cenik",
    locale,
  });
}

export default async function InzerceCenikPage() {
  const locale = await getServerLocale();
  const copy = getInzerceCenikCopy(locale);
  const formHref = localizePublicHref("/inzerce/formular", locale);
  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      ctaHref={formHref}
      ctaLabel={copy.cta}
    >
      <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.starterTitle}</h2>
      <p className="mt-2 text-sm text-slate-600">{copy.starterLead}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#005B96]/20 bg-[#f0f7ff] p-4">
          <p className="text-sm text-slate-700">{copy.native}</p>
          <p className="font-semibold text-[#005B96]">
            {formatCzkListPrice(5000, locale)} {copy.perMonth}
          </p>
        </div>
        <div className="rounded-xl border border-[#005B96]/20 bg-[#f0f7ff] p-4">
          <p className="text-sm text-slate-700">{copy.sponsored}</p>
          <p className="font-semibold text-[#005B96]">{formatCzkListPrice(15000, locale)}</p>
        </div>
        <div className="rounded-xl border border-[#005B96]/20 bg-[#f0f7ff] p-4">
          <p className="text-sm text-slate-700">{copy.mention}</p>
          <p className="font-semibold text-[#005B96]">{formatCzkListPrice(3500, locale)}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">{copy.banners}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRICING_CATALOG.banners.map((b) => (
          <div key={b.placement} className="rounded-xl border border-[#cfe1f3] bg-white p-4 flex justify-between">
            <span className="text-sm text-slate-700">{copy.catalog[b.placement] ?? b.label}</span>
            <span className="font-semibold text-[#005B96]">{formatCzkListPrice(b.price, locale)}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">{copy.newsletter}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRICING_CATALOG.newsletter.map((n) => (
          <div key={n.position} className="rounded-xl border border-[#cfe1f3] bg-white p-4 flex justify-between">
            <span className="text-sm">{copy.catalog[n.position] ?? n.label}</span>
            <span className="font-semibold text-[#005B96]">{formatCzkListPrice(n.price, locale)}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">{copy.packages}</h2>
      <div className="mt-4 space-y-3">
        {PRICING_CATALOG.packages.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#cfe1f3] bg-white p-4">
            <p className="font-semibold">{copy.catalog[p.id] ?? p.label}</p>
            <p className="text-[#005B96]">
              {copy.from} {formatCzkListPrice(p.from, locale)}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm">
        <Link href={formHref} className="text-[#005B96] font-semibold hover:underline">
          {copy.form}
        </Link>
      </p>
    </ModulePageShell>
  );
}
