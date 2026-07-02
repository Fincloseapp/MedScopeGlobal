import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { ORGANIZACE_SECTIONS } from "@/lib/b2b/content";
import { B2bPartnerForm } from "@/components/forms/b2b-partner-form";

export const metadata: Metadata = {
  title: "Organizace a B2B",
  description: "Institucionální licence, partnerství a firemní přístupy pro nemocnice, farmu a výzkum.",
};

export default function OrganizacePage() {
  return (
    <ModulePageShell
      eyebrow="B2B"
      title="Organizace, licence a partnerství"
      description="MedScopeGlobal nabízí institucionální licence, firemní přístupy a etické partnerství pro nemocnice, farmaceutické firmy a výzkumné organizace."
      ctaHref="/organizace/partnerstvi"
      ctaLabel="Partnerství a ceník"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORGANIZACE_SECTIONS.map((s) => (
          <FeatureCard key={s.slug} title={s.title} description={s.description} href={s.href} />
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">Rychlý přehled</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Institucionální licence s RBAC a reportingem</li>
            <li>• B2B partnerství a sponzorované sekce</li>
            <li>• Firemní přístupy a onboarding týmů</li>
            <li>• Nabídky pro nemocnice, farmu a výzkum</li>
          </ul>
          <p className="mt-4 text-sm">
            <Link href="/organizace/licence" className="text-[#005B96] font-semibold hover:underline">
              Typy licencí a integrace →
            </Link>
          </p>
        </div>
        <B2bPartnerForm inquiryType="organizace" />
      </div>
    </ModulePageShell>
  );
}
