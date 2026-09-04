import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { SITE } from "@/lib/config/site";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getB2bPublicCopy } from "@/lib/i18n/b2b-public-copy";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getB2bPublicCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.metaTitleB2b,
    description: copy.metaDescriptionB2b,
    path: "/b2b",
    locale,
  });
}

export default async function B2BPage() {
  const locale = await getServerLocale();
  const region = await getServerRegion();
  const copy = getB2bPublicCopy(locale);
  const banner = formatCzkListPrice(5000, locale, region);
  const article = formatCzkListPrice(15000, locale, region);
  const formHref = localizePublicHref("/inzerce/formular", locale);
  const cenikHref = localizePublicHref("/firmy/cenik", locale);
  const contactHref = localizePublicHref("/kontakt", locale);

  return (
    <ModulePageShell
      eyebrow={copy.b2bEyebrow}
      title={copy.b2bTitle}
      description={copy.b2bLead}
      ctaHref={formHref}
      ctaLabel={copy.contactSales}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={localizePublicHref("/", locale)} className="hover:text-foreground">
          {copy.home}
        </Link>
        <span className="mx-2">/</span>
        <span>B2B</span>
      </nav>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { value: banner, label: copy.bannerMonth, desc: copy.bannerDesc },
          { value: article, label: copy.sponsoredLabel, desc: copy.sponsoredDesc },
          { value: copy.replyValue, label: copy.replyLabel, desc: copy.replyDesc },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
            <p className="font-display text-2xl font-bold text-[#021d33]">{m.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#005B96]">{m.label}</p>
            <p className="mt-1 text-xs text-slate-600">{m.desc}</p>
          </div>
        ))}
      </div>

      <V271B2BPricingTable locale={locale} />

      <p className="mt-6 text-sm">
        <Link href={cenikHref} className="font-medium text-[#005B96] underline underline-offset-2">
          {copy.fullPriceList}
        </Link>
      </p>

      <p className="mt-8 text-sm text-muted-foreground">
        {copy.questions}{" "}
        <Link href={contactHref} className="text-[#005B96] underline">
          {copy.contact}
        </Link>{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="text-[#005B96] underline">
          {SITE.supportEmail}
        </a>
      </p>
    </ModulePageShell>
  );
}
