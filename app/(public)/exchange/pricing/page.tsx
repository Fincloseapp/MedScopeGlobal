import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { EXCHANGE_AD_PACKAGES, EXCHANGE_COMMISSION, EXCHANGE_PLANS_SPEC } from "@/lib/exchange/monetization";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.pricingMetaTitle,
    description: copy.pricingMetaDescription,
    path: "/exchange/pricing",
    locale,
  });
}

export default async function ExchangePricingPage() {
  const locale = await getServerLocale();
  const region = await getServerRegion();
  const copy = getExchangeCopy(locale);
  const plans = [
    { spec: EXCHANGE_PLANS_SPEC.basic, name: copy.planBasic, desc: copy.planBasicDesc },
    { spec: EXCHANGE_PLANS_SPEC.pro, name: copy.planPro, desc: copy.planProDesc },
    { spec: EXCHANGE_PLANS_SPEC.enterprise, name: copy.planEnterprise, desc: copy.planEnterpriseDesc },
  ];

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.pricingTitle} description={copy.pricingLead}>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.spec.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <h2 className="font-display text-xl font-semibold text-[#021d33]">{plan.name}</h2>
            <p className="mt-2 text-2xl font-bold text-[#005B96]">
              {plan.spec.monthlyCzk === 0
                ? copy.planEnterprise
                : formatCzkListPrice(plan.spec.monthlyCzk, locale, region)}
            </p>
            <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
            <Link
              href={localizePublicHref("/exchange/onboard", locale)}
              className="mt-4 inline-block text-sm font-semibold text-[#005B96] hover:underline"
            >
              {copy.onboardCta} →
            </Link>
          </article>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#f7fbff] p-5">
        <h2 className="font-display text-xl font-semibold">{copy.commissionTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{copy.commissionBody}</p>
        <p className="mt-2 text-xs text-slate-500">
          Contact fee {EXCHANGE_COMMISSION.contactFeePercent}% · success fee{" "}
          {EXCHANGE_COMMISSION.successFeeMinPercent}–{EXCHANGE_COMMISSION.successFeeMaxPercent}% opt-in
        </p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">{copy.adsTitle}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.values(EXCHANGE_AD_PACKAGES).map((pack) => (
            <li key={pack.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-4 text-sm">
              <p className="font-semibold capitalize">{pack.id.replace("_", " ")}</p>
              <p className="mt-1 text-[#005B96]">{formatCzkListPrice(pack.monthlyCzk, locale, region)}</p>
            </li>
          ))}
        </ul>
      </section>
    </ModulePageShell>
  );
}
