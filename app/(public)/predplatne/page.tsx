import type { Metadata } from "next";
import Link from "next/link";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { V27_SUBSCRIPTION_PLANS, subscriptionProductId } from "@/lib/v27/config";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { getSiteVersionLabel } from "@/lib/v27/version";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Předplatné | MedScopeGlobal",
    description:
      "Trvalé předplatné pro veřejnost, studenty a lékaře — měsíční a roční plány. Platba kartou, Apple Pay a Google Pay.",
    path: "/predplatne",
  });
}

export default function PredplatnePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          MedScope {getSiteVersionLabel()} · Předplatné
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Trvalé předplatné</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Měsíční nebo roční plány pro veřejnost, studenty medicíny a lékaře. Platba přes Stripe
          včetně Apple Pay a Google Pay.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Vyberte plán</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {V27_SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.tier}
              className="flex flex-col rounded-2xl border border-[#005B96]/20 bg-white p-6 shadow-sm ring-1 ring-[#005B96]/10"
            >
              <h3 className="font-display text-xl font-semibold text-[#005B96]">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold">{plan.monthlyCzk} Kč</span>
                <span className="text-muted-foreground"> / měsíc</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Roční: <span className="font-semibold text-[#005B96]">{plan.annualCzk} Kč</span> / rok
              </p>
              <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <div className="mt-6 space-y-2">
                <V27CheckoutButton
                  kind="subscription"
                  productId={subscriptionProductId(plan.tier, "month")}
                  label="Předplatit měsíčně"
                />
                <V27CheckoutButton
                  kind="subscription"
                  productId={subscriptionProductId(plan.tier, "year")}
                  label="Předplatit ročně"
                  className="w-full border border-[#005B96]/30 bg-white text-[#005B96] hover:bg-[#005B96]/5"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        B2B nabídka pro firmy na{" "}
        <Link href="/firmy" className="text-[#005B96] underline">
          /firmy
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
