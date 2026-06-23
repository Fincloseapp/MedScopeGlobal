import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { SubscriptionComparisonTable } from "@/components/subscription/subscription-comparison-table";
import { SubscriptionFaq } from "@/components/subscription/subscription-faq";
import { SubscriptionTrialBanner } from "@/components/subscription/subscription-trial-banner";
import { SubscriptionTrustBadges } from "@/components/subscription/subscription-trust-badges";
import { V27_SUBSCRIPTION_PLANS, subscriptionProductId } from "@/lib/v27/config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Předplatné | MedScopeGlobal",
  description: `${VIP_TRIAL_DAYS}denní zkušební verze zdarma. Tarify 99 / 149 / 490 Kč měsíčně pro veřejnost, studenty a lékaře. Platba kartou přes Stripe.`,
  path: "/predplatne",
});

export default function PredplatnePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          Předplatné
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">
          Prémiový přístup k medicínskému obsahu
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Měsíční nebo roční plány pro veřejnost, studenty medicíny a lékaře. Bez reklam, s AI
          asistenty a odborným obsahem — platba přes Stripe včetně Apple Pay a Google Pay.
        </p>
      </div>

      <div className="mt-10">
        <SubscriptionTrialBanner />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Vyberte plán</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Všechny tarify zahrnují {VIP_TRIAL_DAYS} dní zkušební verze zdarma. Po kliknutí přejdete
          na zabezpečenou Stripe pokladnu.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {V27_SUBSCRIPTION_PLANS.map((plan) => {
            const highlighted = plan.tier === "student";
            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                  highlighted
                    ? "border-[#005B96] ring-2 ring-[#005B96]/25"
                    : "border-[#005B96]/20 ring-1 ring-[#005B96]/10"
                }`}
              >
                {highlighted ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#005B96] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Nejoblíbenější
                  </span>
                ) : null}
                <span className="inline-flex w-fit rounded-full bg-[#005B96]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
                  {VIP_TRIAL_DAYS} dní zdarma
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-[#005B96]">
                  {plan.name}
                </h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold">{plan.monthlyCzk} Kč</span>
                  <span className="text-muted-foreground"> / měsíc</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Roční: <span className="font-semibold text-[#005B96]">{plan.annualCzk} Kč</span>{" "}
                  / rok <span className="text-emerald-700">(≈ 2 měsíce zdarma)</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-emerald-600" aria-hidden>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-2">
                  <V27CheckoutButton
                    kind="subscription"
                    productId={subscriptionProductId(plan.tier, "month")}
                    label={`Začít ${VIP_TRIAL_DAYS}denní trial — měsíčně`}
                  />
                  <V27CheckoutButton
                    kind="subscription"
                    productId={subscriptionProductId(plan.tier, "year")}
                    label={`Začít trial — ročně (${plan.annualCzk} Kč)`}
                    className="w-full border border-[#005B96]/30 bg-white text-[#005B96] hover:bg-[#005B96]/5"
                  />
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Po {VIP_TRIAL_DAYS} dnech {plan.monthlyCzk} Kč/měs. · zrušení kdykoli
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <SubscriptionComparisonTable />
      <SubscriptionTrustBadges />
      <SubscriptionFaq />

      <div className="mt-12 rounded-2xl border border-[#005B96]/15 bg-[#f0f7ff]/50 px-6 py-8 text-center">
        <h2 className="font-display text-xl font-semibold text-[#021d33]">
          Ještě nemáte účet?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Zaregistrujte se zdarma, poté se vraťte sem a aktivujte zkušební verzi vybraného tarifu.
        </p>
        <Button asChild className="mt-4">
          <Link href="/signup">Vytvořit účet zdarma</Link>
        </Button>
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        B2B nabídka pro firmy na{" "}
        <Link href="/organizace" className="text-[#005B96] underline">
          /organizace
        </Link>
        . Dotazy:{" "}
        <Link href="/kontakt" className="text-[#005B96] underline">
          kontakt
        </Link>
        .
      </p>
    </div>
  );
}
