import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PRICING_CATALOG } from "@/lib/ads/pricing";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getServerLocale } from "@/lib/i18n/server-locale";

export const metadata: Metadata = {
  title: "Ceník inzerce",
  description: "Ceny bannerů, newsletteru a kombinovaných balíčků.",
};

export default async function InzerceCenikPage() {
  const locale = await getServerLocale();
  return (
    <ModulePageShell
      eyebrow="Ceník"
      title="Ceník reklamy"
      description="Orientační ceny za 30 dní. Finální cena se potvrdí ve formuláři s automatickým naceněním."
      ctaHref="/inzerce/formular"
      ctaLabel="Spočítat a odeslat"
    >
      <h2 className="font-display text-xl font-semibold text-[#021d33]">ViaLongeVita — startovací sazby</h2>
      <p className="mt-2 text-sm text-slate-600">
        Orientační sazby pro čtenáře dlouhověkosti. Níže je širší sazebník.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#005B96]/20 bg-[#f0f7ff] p-4">
          <p className="text-sm text-slate-700">Native banner</p>
          <p className="font-semibold text-[#005B96]">{formatCzkListPrice(5000, locale)} / měsíc</p>
        </div>
        <div className="rounded-xl border border-[#005B96]/20 bg-[#f0f7ff] p-4">
          <p className="text-sm text-slate-700">Sponzorovaný článek</p>
          <p className="font-semibold text-[#005B96]">{formatCzkListPrice(15000, locale)}</p>
        </div>
        <div className="rounded-xl border border-[#005B96]/20 bg-[#f0f7ff] p-4">
          <p className="text-sm text-slate-700">Mention v newsletteru</p>
          <p className="font-semibold text-[#005B96]">{formatCzkListPrice(3500, locale)}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">Bannery</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRICING_CATALOG.banners.map((b) => (
          <div key={b.placement} className="rounded-xl border border-[#cfe1f3] bg-white p-4 flex justify-between">
            <span className="text-sm text-slate-700">{b.label}</span>
            <span className="font-semibold text-[#005B96]">{formatCzkListPrice(b.price, locale)}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">Newsletter</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRICING_CATALOG.newsletter.map((n) => (
          <div key={n.position} className="rounded-xl border border-[#cfe1f3] bg-white p-4 flex justify-between">
            <span className="text-sm">{n.label}</span>
            <span className="font-semibold text-[#005B96]">{formatCzkListPrice(n.price, locale)}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold text-[#021d33]">Kombinované balíčky</h2>
      <div className="mt-4 space-y-3">
        {PRICING_CATALOG.packages.map((p) => (
          <div key={p.id} className="rounded-xl border border-[#cfe1f3] bg-white p-4">
            <p className="font-semibold">{p.label}</p>
            <p className="text-[#005B96]">od {formatCzkListPrice(p.from, locale)}</p>
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
