import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { LICENSE_TIERS } from "@/lib/b2b/content";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getOrganizaceHubCopy } from "@/lib/i18n/organizace-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOrganizaceHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.licenceMetaTitle,
    description: copy.licenceMetaDescription,
    path: "/organizace/licence",
    locale,
  });
}

export default async function LicencePage() {
  const locale = await getServerLocale();
  const copy = getOrganizaceHubCopy(locale);
  const extras = {
    team: { seats: copy.seatsTeam, price: copy.priceFrom, features: copy.featuresTeam },
    hospital: { seats: copy.seatsHospital, price: copy.individual, features: copy.featuresHospital },
    enterprise: { seats: copy.seatsEnterprise, price: copy.individual, features: copy.featuresEnterprise },
  } as const;

  return (
    <ModulePageShell
      eyebrow={copy.licenceEyebrow}
      title={copy.licenceTitle}
      description={copy.licenceLead}
      ctaHref={localizePublicHref("/kontakt", locale)}
      ctaLabel={copy.licenceCta}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {LICENSE_TIERS.map((tier) => {
          const extra = extras[tier.id as keyof typeof extras];
          return (
            <div key={tier.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-6">
              <h3 className="font-display text-xl font-semibold text-[#021d33]">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{extra?.seats ?? tier.seats}</p>
              <p className="mt-3 text-lg font-semibold text-[#005B96]">{extra?.price ?? tier.price}</p>
              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                {(extra?.features ?? [...tier.features]).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-10 rounded-2xl border border-dashed border-[#8dc4ea] bg-[#f8fcff] p-6 text-sm text-slate-600">
        <h3 className="font-semibold text-[#021d33]">{copy.integrationTitle}</h3>
        <p className="mt-2">{copy.integrationLead}</p>
      </div>
    </ModulePageShell>
  );
}
