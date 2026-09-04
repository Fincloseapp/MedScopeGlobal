import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { SITE } from "@/lib/config/site";
import { getB2bPublicCopy } from "@/lib/i18n/b2b-public-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getB2bPublicCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.metaTitleCenik,
    description: copy.metaDescriptionCenik,
    path: "/firmy/cenik",
    locale,
  });
}

export default async function FirmyCenikPage() {
  const locale = await getServerLocale();
  const copy = getB2bPublicCopy(locale);
  const formHref = localizePublicHref("/inzerce/formular", locale);
  const contactHref = localizePublicHref("/kontakt", locale);

  return (
    <ModulePageShell
      eyebrow={copy.cenikEyebrow}
      title={copy.cenikTitle}
      description={copy.cenikLead}
      ctaHref={formHref}
      ctaLabel={copy.requestQuote}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={localizePublicHref("/", locale)} className="hover:text-foreground">
          {copy.home}
        </Link>
        <span className="mx-2">/</span>
        <Link href={localizePublicHref("/b2b", locale)} className="hover:text-foreground">
          B2B
        </Link>
        <span className="mx-2">/</span>
        <span>{copy.cenikEyebrow}</span>
      </nav>

      <V271B2BPricingTable locale={locale} />

      <div className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] p-6">
        <h2 className="font-display text-lg font-semibold text-[#021d33]">{copy.whyTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {copy.whyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

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
