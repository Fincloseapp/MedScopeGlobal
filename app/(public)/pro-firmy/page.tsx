import type { Metadata } from "next";
import Link from "next/link";
import { V27AudienceHub } from "@/components/v27/audience-hub-section";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { getB2BLandingCopy } from "@/lib/i18n/b2b-landing-copy";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
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

export default async function ProFirmyPage() {
  const locale = await getServerLocale();
  const copy = getB2BLandingCopy(locale);
  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <V27AudienceHub audience="b2b" variant="hero" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section>
          <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.audienceTitle}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            {copy.audience.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-[#021d33]">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.formatsTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {copy.formats.map((f) => (
              <div key={f.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-[#021d33]">{f.name}</p>
                <p className="text-sm text-slate-600">{f.reach}</p>
                <p className="mt-2 text-sm font-medium text-[#005B96]">{f.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ceny" className="mt-12">
          <h2 className="font-display text-2xl font-bold text-[#021d33]">{copy.packagesTitle}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {V27_B2B_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-display text-xl font-semibold text-[#021d33]">{pkg.name}</h3>
                <p className="mt-2 text-3xl font-bold text-[#005B96]">
                  {pkg.priceCzk > 0 ? formatCzkListPrice(pkg.priceCzk, locale) : copy.individualPrice}
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
            {copy.customCampaign}{" "}
            <Link href="/inzerce/formular" className="font-medium text-[#005B96] hover:underline">
              {copy.formCta}
            </Link>{" "}
            nebo{" "}
            <Link href="/organizace/partnerstvi" className="font-medium text-[#005B96] hover:underline">
              {copy.partnershipCta}
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
