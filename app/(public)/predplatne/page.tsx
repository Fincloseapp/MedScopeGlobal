import type { Metadata } from "next";
import Link from "next/link";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { SubscriptionComparisonTable } from "@/components/subscription/subscription-comparison-table";
import { SubscriptionFaq } from "@/components/subscription/subscription-faq";
import { SubscriptionTrialBanner } from "@/components/subscription/subscription-trial-banner";
import { SubscriptionTrustBadges } from "@/components/subscription/subscription-trust-badges";
import { V27_SUBSCRIPTION_PLANS, subscriptionProductId } from "@/lib/v27/config";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { VIP_TRIAL_DAYS } from "@/lib/vip";
import { APP_PRODUCTS } from "@/lib/apps/catalog";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Předplatné | MedScopeGlobal",
    description: `${VIP_TRIAL_DAYS}denní zkušební verze zdarma. Tarify 99 / 149 / 390 / 490 Kč měsíčně — včetně OrdiZapis od MedScopeGlobal. Platba kartou přes Stripe.`,
    path: "/predplatne",
  });
}

export default async function PredplatnePage({
  searchParams,
}: {
  searchParams: Promise<{ trial?: string; plan?: string }>;
}) {
  const { trial, plan } = await searchParams;
  const highlightTrial = trial === "1";
  const fromVip = plan === "vip";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          Předplatné
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">
          {fromVip ? "VIP Longevity · 149 Kč/měsíc" : "Prémiový přístup k medicínskému obsahu"}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {fromVip
            ? "VIP protokoly a MediFlow sync. Níže také tarify aplikací (Veřejnost, Student LF, OrdiZapis, Lékař) — vyberte jen jeden plán."
            : "Měsíční nebo roční plány pro veřejnost (MeDipacient), studenty (MeDiprep), ordinace (OrdiZapis) a lékaře. VIP longevity je samostatná nabídka na /vip/protokoly."}
        </p>
      </div>

      <div className="mt-10">
        <SubscriptionTrialBanner />
      </div>

      {fromVip ? (
        <section
          id="vip"
          className="mt-6 scroll-mt-24 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-5 sm:px-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
            VIP Longevity — co dostanete
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
            10 longevity protokolů, MediFlow sync a PDF export za{" "}
            <span className="font-semibold text-[#021d33]">149 Kč/měsíc</span>
            . Toto není tarif Student LF (příprava na přijímačky) — stejná cena, jiný produkt.{" "}
            <Link href="/vip/protokoly" className="font-semibold text-amber-800 hover:underline">
              Prohlédnout protokoly →
            </Link>
          </p>
          <div className="mt-4">
            <V27CheckoutButton
              kind="subscription"
              productId={subscriptionProductId("public", "month")}
              label="Aktivovat VIP trial (tarif Veřejnost + protokoly)"
            />
          </div>
        </section>
      ) : null}

      {highlightTrial && !fromVip ? (
        <p className="mt-6 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff]/80 px-4 py-3 text-center text-sm text-slate-700">
          Přicházíte z trial CTA — níže je zvýrazněný tarif{" "}
          <Link href="#student" className="font-semibold text-[#005B96] hover:underline">
            Student LF
          </Link>{" "}
          (příprava na přijímačky i studium). Pro VIP longevity použijte{" "}
          <Link href="/vip/protokoly" className="font-semibold text-amber-800 hover:underline">
            /vip/protokoly
          </Link>
          .
        </p>
      ) : null}

      <section
        id="pro-rodice"
        className="mt-8 scroll-mt-24 rounded-2xl border border-[#cfe1f3] bg-white px-5 py-5 sm:px-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#005B96]">
          Tip pro rodiče a uchazeče
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
          Tarif Student LF (149 Kč/měsíc) otevírá Academy, AI tutor a kvízy. Nejdřív vyzkoušejte{" "}
          <Link href="/academy/prijimacky/self-test" className="text-[#005B96] hover:underline">
            self-test
          </Link>{" "}
          a jednu lekci zdarma — pak dává trial smysl.{" "}
          <Link href="/studenti#pro-rodice" className="text-[#005B96] hover:underline">
            Více pro rodiče na /studenti
          </Link>
          .
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {APP_PRODUCTS.map((app) => (
          <article key={app.id} className="rounded-2xl border border-[#d9e8f4] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">{app.audience}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{app.shortName}</h2>
            <p className="mt-1 text-sm text-slate-600">{app.tagline}</p>
            <p className="mt-2 text-xs text-slate-500">{app.priceNote}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={app.appPath} className="text-sm font-semibold text-[#005B96]">
                Otevřít →
              </Link>
              <Link href={app.downloadPath} className="text-sm text-slate-500">
                Stáhnout na mobil
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Vyberte plán</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Všechny tarify zahrnují {VIP_TRIAL_DAYS} dní zkušební verze zdarma. Po kliknutí přejdete
          na zabezpečenou Stripe pokladnu.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {V27_SUBSCRIPTION_PLANS.map((plan) => {
            const highlighted = plan.tier === "dokumentace";
            const studentHighlight = plan.tier === "student" && !highlighted;
            return (
              <div
                key={plan.tier}
                id={plan.tier}
                className={`relative flex scroll-mt-24 flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                  highlighted
                    ? "border-emerald-600 ring-2 ring-emerald-500/30"
                    : studentHighlight
                      ? "border-[#005B96] ring-2 ring-[#005B96]/25"
                      : "border-[#005B96]/20 ring-1 ring-[#005B96]/10"
                }`}
              >
                {highlighted ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-700 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Nejvýhodnější pro ordinaci — 390 Kč
                  </span>
                ) : null}
                {studentHighlight ? (
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
                  / rok{" "}
                  <span className="text-emerald-700">(≈ 2 měsíce zdarma)</span>
                </p>
                {plan.tier === "dokumentace" ? (
                  <p className="mt-2 text-xs font-medium text-emerald-800">
                    Stejná práva lékaře jako tarif 490 Kč — levnější vstup s AI zápisy.
                  </p>
                ) : null}
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
                    label={
                      plan.tier === "dokumentace"
                        ? `Začít ${VIP_TRIAL_DAYS} dní zdarma — 390 Kč`
                        : `Začít ${VIP_TRIAL_DAYS}denní trial — měsíčně`
                    }
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
        <Link
          href="/signup"
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-[#005B96]/30 bg-white px-6 py-2.5 text-sm font-semibold text-[#005B96] hover:bg-[#005B96]/5"
        >
          Vytvořit účet zdarma
        </Link>
      </div>

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
