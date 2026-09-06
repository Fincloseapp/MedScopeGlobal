import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { B2bPartnerForm } from "@/components/forms/b2b-partner-form";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getOrganizaceHubCopy } from "@/lib/i18n/organizace-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOrganizaceHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.partnerMetaTitle,
    description: copy.partnerMetaDescription,
    path: "/organizace/partnerstvi",
    locale,
  });
}

export default async function PartnerstviPage() {
  const locale = await getServerLocale();
  const copy = getOrganizaceHubCopy(locale);
  const pricing = [
    { name: "Partner Start", price: formatCzkListPrice(89000, locale), note: copy.partnerNotes[0] },
    { name: "Partner Clinical", price: formatCzkListPrice(149000, locale), note: copy.partnerNotes[1] },
    { name: "Partner Enterprise", price: copy.individual, note: copy.partnerNotes[2] },
  ];

  return (
    <ModulePageShell
      eyebrow={copy.partnerEyebrow}
      title={copy.partnerTitle}
      description={copy.partnerLead}
      ctaHref={localizePublicHref("/inzerce/formular", locale)}
      ctaLabel={copy.partnerCta}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.benefitsTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {copy.benefits.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
          <h2 className="mt-8 font-display text-xl font-semibold text-[#021d33]">{copy.partnerPricingTitle}</h2>
          <div className="mt-4 space-y-3">
            {pricing.map((p) => (
              <div key={p.name} className="rounded-xl border border-[#cfe1f3] bg-white p-4">
                <p className="font-semibold text-[#021d33]">{p.name}</p>
                <p className="text-[#005B96] font-semibold">{p.price}</p>
                <p className="text-xs text-slate-500">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.partnerFormTitle}</h2>
          <div className="mt-4">
            <B2bPartnerForm inquiryType="partnerstvi" />
          </div>
        </div>
      </div>
    </ModulePageShell>
  );
}
