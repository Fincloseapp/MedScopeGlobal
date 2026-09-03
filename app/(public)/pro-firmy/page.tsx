import type { Metadata } from "next";
import Link from "next/link";
import { V27AudienceHub } from "@/components/v27/audience-hub-section";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { formatCzkListPrice, localizeListedCzk } from "@/lib/i18n/payment-currency";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { V27_B2B_PACKAGES } from "@/lib/v27/config";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Pro firmy | MedScopeGlobal B2B",
    description:
      "Reklamní formáty, pharma balíčky, kliniky, laboratoře a univerzitní partnerství na MedScopeGlobal.",
    path: "/pro-firmy",
  });
}

function adFormats(locale: string) {
  return [
    { name: "Banner homepage", reach: "Homepage a články", price: localizeListedCzk("od 8 000 Kč", locale) },
    { name: "Sponzorovaný článek", reach: "Newsletter + SEO", price: localizeListedCzk("od 15 000 Kč", locale) },
    { name: "Newsletter slot", reach: "Týdenní brief", price: localizeListedCzk("od 5 000 Kč", locale) },
    { name: "Segmentace publika", reach: "Lékaři / studenti / veřejnost", price: "v balíčku" },
  ];
}

const AUDIENCE = [
  { title: "Čtenáři dlouhověkosti", body: "Prevence, spánek, pohyb a výživa." },
  { title: "Lékaři a studenti", body: "Samostatné odborné plochy, bez affiliate." },
  { title: "Týdenní brief", body: "Stejná redakce ViaLongeVita ve schránce." },
  { title: "Označený obsah", body: "Sponzorované texty mají vždy jasné označení." },
];

export default async function ProFirmyPage() {
  const locale = await getServerLocale();
  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <V27AudienceHub audience="b2b" variant="hero" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">Publikum</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            {AUDIENCE.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-[#021d33]">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[#021d33]">Reklamní formáty</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {adFormats(locale).map((f) => (
              <div key={f.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-[#021d33]">{f.name}</p>
                <p className="text-sm text-slate-600">{f.reach}</p>
                <p className="mt-2 text-sm font-medium text-[#005B96]">{f.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ceny" className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[#021d33]">Balíčky</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {V27_B2B_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-display text-xl font-semibold text-[#021d33]">{pkg.name}</h3>
                <p className="mt-2 text-3xl font-bold text-[#005B96]">
                  {pkg.priceCzk > 0 ? formatCzkListPrice(pkg.priceCzk, locale) : "Individuálně"}
                </p>
                <p className="mt-2 text-sm text-slate-600">{pkg.desc}</p>
                <div className="mt-4">
                  <V27CheckoutButton kind="b2b_package" productId={pkg.id} label="Objednat balíček" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 text-center">
          <p className="text-sm text-slate-600">
            Vlastní kampaň?{" "}
            <Link href="/inzerce/formular" className="font-medium text-[#005B96] hover:underline">
              Vyplňte formulář inzerce
            </Link>{" "}
            nebo{" "}
            <Link href="/organizace/partnerstvi" className="font-medium text-[#005B96] hover:underline">
              univerzitní partnerství
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
