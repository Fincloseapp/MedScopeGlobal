import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { EXCHANGE_AD_PACKAGES, EXCHANGE_COMMISSION, EXCHANGE_PLANS_SPEC } from "@/lib/exchange/monetization";
import { chromePack } from "@/lib/i18n/chrome-pack";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeSubCopy } from "@/lib/i18n/exchange-subscription-copy";
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
  const sub = getExchangeSubCopy(locale);
  const onRequest: Record<string, string> = {
    cs: "Na míru",
    de: "Auf Anfrage",
    fr: "Sur devis",
    it: "Su richiesta",
    es: "A medida",
    "pt-BR": "Sob consulta",
    en: "On request",
  };
  const customPrice = onRequest[chromePack(locale)] ?? "On request";
  const plans = [
    { spec: EXCHANGE_PLANS_SPEC.basic, name: copy.planBasic, desc: copy.planBasicDesc },
    { spec: EXCHANGE_PLANS_SPEC.pro, name: copy.planPro, desc: copy.planProDesc },
    { spec: EXCHANGE_PLANS_SPEC.enterprise, name: copy.planEnterprise, desc: copy.planEnterpriseDesc },
  ];

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.pricingTitle} description={copy.pricingLead}>
      <p className="mb-6 text-sm font-medium text-[#005B96]">{sub.buyerFree}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.spec.id}
            className={`rounded-2xl border bg-white p-5 ${plan.spec.paid ? "border-[#c4a35a]" : "border-[#cfe1f3]"}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c4a35a]">
              {plan.spec.paid ? sub.paid : sub.free}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#021d33]">{plan.name}</h2>
            <p className="mt-2 text-2xl font-bold text-[#005B96]">
              {!plan.spec.paid
                ? sub.free
                : plan.spec.monthlyCzk === 0
                  ? customPrice
                  : formatCzkListPrice(plan.spec.monthlyCzk, locale, region)}
            </p>
            <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
            <ul className="mt-4 space-y-1 text-sm text-slate-700">
              {sub.planFeatures[plan.spec.id].map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
            <Link
              href={localizePublicHref(
                plan.spec.paid ? `/exchange/dashboard?as=${plan.spec.id}` : "/exchange/onboard",
                locale
              )}
              className="mt-4 inline-block text-sm font-semibold text-[#005B96] hover:underline"
            >
              {plan.spec.paid ? sub.activate : copy.onboardCta} →
            </Link>
          </article>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#f7fbff] p-5">
        <h2 className="font-display text-xl font-semibold">{copy.commissionTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{copy.commissionBody}</p>
        <p className="mt-2 text-xs text-slate-500">
          {EXCHANGE_COMMISSION.revenueModel} · deal commission {EXCHANGE_COMMISSION.dealCommissionPercent}% · success
          fee {EXCHANGE_COMMISSION.successFeePercent}%
        </p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">{copy.adsTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{sub.adsPaidOnly}</p>
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
