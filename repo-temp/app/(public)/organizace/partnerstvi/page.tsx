import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PARTNERSHIP_BENEFITS } from "@/lib/b2b/content";
import { B2bPartnerForm } from "@/components/forms/b2b-partner-form";
import { formatCzk } from "@/lib/ads/pricing";

export const metadata: Metadata = {
  title: "B2B partnerství",
  description: "Výhody partnerství, ceník a formulář pro firmy.",
};

const PRICING = [
  { name: "Partner Start", price: formatCzk(89000), note: "Sekce + newsletter 1× měsíčně" },
  { name: "Partner Clinical", price: formatCzk(149000), note: "Diagnóza + studie + reporting" },
  { name: "Partner Enterprise", price: "individuálně", note: "Multi-sekce + AI reporting" },
];

export default function PartnerstviPage() {
  return (
    <ModulePageShell
      eyebrow="Partnerství"
      title="B2B partnerství"
      description="Etické sponzorství obsahu, měřitelný dosah a transparentní označení partnerů."
      ctaHref="/inzerce/formular"
      ctaLabel="Reklamní formulář"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#021d33]">Výhody</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {PARTNERSHIP_BENEFITS.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
          <h2 className="mt-8 font-display text-xl font-semibold text-[#021d33]">Ceník partnerství</h2>
          <div className="mt-4 space-y-3">
            {PRICING.map((p) => (
              <div key={p.name} className="rounded-xl border border-[#cfe1f3] bg-white p-4">
                <p className="font-semibold text-[#021d33]">{p.name}</p>
                <p className="text-[#005B96] font-semibold">{p.price}</p>
                <p className="text-xs text-slate-500">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-[#021d33]">Formulář pro firmy</h2>
          <div className="mt-4">
            <B2bPartnerForm inquiryType="partnerstvi" />
          </div>
        </div>
      </div>
    </ModulePageShell>
  );
}
