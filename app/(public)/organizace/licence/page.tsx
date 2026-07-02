import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { LICENSE_TIERS } from "@/lib/b2b/content";

export const metadata: Metadata = {
  title: "Institucionální licence",
  description: "Typy licencí, ceny a možnosti integrace pro organizace.",
};

export default function LicencePage() {
  return (
    <ModulePageShell
      eyebrow="Licence"
      title="Institucionální licence"
      description="Multi-seat přístup, SSO a integrace s interními systémy nemocnic a univerzit."
      ctaHref="/contact"
      ctaLabel="Kontaktovat obchod"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {LICENSE_TIERS.map((tier) => (
          <div key={tier.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-6">
            <h3 className="font-display text-xl font-semibold text-[#021d33]">{tier.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{tier.seats}</p>
            <p className="mt-3 text-lg font-semibold text-[#005B96]">{tier.price}</p>
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {tier.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-dashed border-[#8dc4ea] bg-[#f8fcff] p-6 text-sm text-slate-600">
        <h3 className="font-semibold text-[#021d33]">Možnosti integrace</h3>
        <p className="mt-2">
          SAML/OIDC SSO, export citací, webhook notifikace, SCIM provisioning (Enterprise) a napojení na
          interní LMS.
        </p>
      </div>
    </ModulePageShell>
  );
}
