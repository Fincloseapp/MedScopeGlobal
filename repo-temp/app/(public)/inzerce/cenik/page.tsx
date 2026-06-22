import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PRICING_CATALOG, formatCzk } from "@/lib/ads/pricing";

export const metadata: Metadata = {
  title: "Ceník inzerce",
  description: "Ceny bannerů, newsletteru a kombinovaných balíčků.",
};

export default function InzerceCenikPage() {
  return (
    <ModulePageShell
      eyebrow="Ceník"
      title="Ceník reklamy"
      description="Orientační ceny za 30 dní. Finální cena se potvrdí ve formuláři s automatickým naceněním."
      ctaHref="/inzerce/formular"
      ctaLabel="Spočítat a odeslat"
    >
      <h2 className="font-display text-xl font-semibold text-[#021d33]">Bannery</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRICING_CATALOG.banners.map((b) => (
          <div key={b.placement} className="rounded-xl border border-[#cfe1f3] bg-white p-4 flex justify-between">
            <span className="text-sm text-slate-700">{b.label}</span>
            <span className="font-semibold text-[#005B96]">{formatCzk(b.price)}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">Newsletter</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRICING_CATALOG.newsletter.map((n) => (
          <div key={n.position} className="rounded-xl border border-[#cfe1f3] bg-white p-4 flex justify-between">
            <span className="text-sm">{n.label}</span>
            <span className="font-semibold text-[#005B96]">{formatCzk(n.price)}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">Kombinované balíčky</h2>
      <div className="mt-4 space-y-3">
        {PRICING_CATALOG.packages.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#cfe1f3] bg-white p-4">
            <p className="font-semibold">{p.label}</p>
            <p className="text-[#005B96]">od {formatCzk(p.from)}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm">
        <Link href="/inzerce/formular" className="text-[#005B96] font-semibold hover:underline">
          Přejít na formulář →
        </Link>
      </p>
    </ModulePageShell>
  );
}
