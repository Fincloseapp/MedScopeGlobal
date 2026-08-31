import type { Metadata } from "next";
import Link from "next/link";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { SubscriptionComparisonTable } from "@/components/subscription/subscription-comparison-table";
import { SubscriptionFaq } from "@/components/subscription/subscription-faq";
import { SubscriptionTrialBanner } from "@/components/subscription/subscription-trial-banner";
import { SubscriptionTrustBadges } from "@/components/subscription/subscription-trust-badges";
import { V27_SUBSCRIPTION_PLANS, subscriptionProductId } from "@/lib/v27/config";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { APP_PRODUCTS, type AppProductId } from "@/lib/apps/catalog";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getSubscribeCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/predplatne",
    locale,
  });
}

export default async function PredplatnePage({
  searchParams,
}: {
  searchParams: Promise<{ trial?: string }>;
}) {
  const { trial } = await searchParams;
  const highlightTrial = trial === "1";
  const locale = await getServerLocale();
  const copy = getSubscribeCopy(locale);
  const surface = getSurfaceCopy(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{copy.lead}</p>
      </div>

      <div className="mt-10">
        <SubscriptionTrialBanner locale={locale} />
      </div>

      {highlightTrial ? (
        <p className="mt-6 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff]/80 px-4 py-3 text-center text-sm text-slate-700">
          {copy.trialFromCta}{" "}
          <Link href="#student" className="font-semibold text-[#005B96] hover:underline">
            {copy.studentPlan}
          </Link>{" "}
          {copy.trialFromCtaRest}
        </p>
      ) : null}

      <section
        id="pro-rodice"
        className="mt-8 scroll-mt-24 rounded-2xl border border-[#cfe1f3] bg-white px-5 py-5 sm:px-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#005B96]">
          {copy.parentsTip}
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
          {copy.parentsBodyBefore}{" "}
          <Link
            href={localizePublicHref("/academy/prijimacky/self-test", locale)}
            className="text-[#005B96] hover:underline"
          >
            {copy.selfTest}
          </Link>{" "}
          {copy.parentsBodyMid}{" "}
          <Link
            href={localizePublicHref("/studenti#pro-rodice", locale)}
            className="text-[#005B96] hover:underline"
          >
            {copy.parentsMore}
          </Link>
          .
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {APP_PRODUCTS.map((app) => (
          <article key={app.id} className="rounded-2xl border border-[#d9e8f4] bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
              {copy.audienceByApp[app.id] ?? app.audience}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">{app.shortName}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {surface.appTaglines[app.id as AppProductId] ?? app.tagline}
            </p>
            <p className="mt-2 text-xs text-slate-500">{copy.priceNoteByApp[app.id] ?? app.priceNote}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={app.appPath} className="text-sm font-semibold text-[#005B96]">
                {copy.openApp}
              </Link>
              <Link href={app.downloadPath} className="text-sm text-slate-500">
                {copy.downloadApp}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.choosePlan}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.choosePlanLead}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {V27_SUBSCRIPTION_PLANS.map((plan) => {
            const localized = copy.plans[plan.tier];
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
                    {copy.bestForClinic}
                  </span>
                ) : null}
                {studentHighlight ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#005B96] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {copy.mostPopular}
                  </span>
                ) : null}
                <span className="inline-flex w-fit rounded-full bg-[#005B96]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
                  {copy.daysFree}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-[#005B96]">
                  {localized.name}
                </h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.monthlyCzk} {copy.currencyLabel}
                  </span>
                  <span className="text-muted-foreground"> {copy.perMonth}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {copy.yearly}{" "}
                  <span className="font-semibold text-[#005B96]">
                    {plan.annualCzk} {copy.currencyLabel}
                  </span>{" "}
                  {copy.perYear}{" "}
                  <span className="text-emerald-700">{copy.twoMonthsFree}</span>
                </p>
                {localized.extraNote ? (
                  <p className="mt-2 text-xs font-medium text-emerald-800">{localized.extraNote}</p>
                ) : null}
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  {localized.features.map((f) => (
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
                      plan.tier === "dokumentace" ? copy.startOrdiZapis : copy.startTrialMonth
                    }
                  />
                  <V27CheckoutButton
                    kind="subscription"
                    productId={subscriptionProductId(plan.tier, "year")}
                    label={`${copy.startTrialYear} (${plan.annualCzk} ${copy.currencyLabel})`}
                    className="w-full border border-[#005B96]/30 bg-white text-[#005B96] hover:bg-[#005B96]/5"
                  />
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">
                  {copy.afterTrial} {plan.monthlyCzk} {copy.afterTrialUnit} · {copy.cancelAnytime}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <SubscriptionComparisonTable locale={locale} />
      <SubscriptionTrustBadges locale={locale} />
      <SubscriptionFaq locale={locale} />

      <div className="mt-12 rounded-2xl border border-[#cfe1f3] bg-white px-6 py-8 text-center">
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.supportTitle}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{copy.supportLead}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={localizePublicHref("/verejnost/clanky?topic=dlouhovekost", locale)}
            className="inline-flex items-center justify-center rounded-lg bg-[#005B96] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            {copy.supportCta}
          </Link>
          <Link
            href={localizePublicHref("/verejnost/clanky", locale)}
            className="inline-flex items-center justify-center rounded-lg border border-[#005B96]/30 bg-white px-6 py-2.5 text-sm font-semibold text-[#005B96] hover:bg-[#005B96]/5"
          >
            {copy.keepReading}
          </Link>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-[#005B96]/15 bg-[#f0f7ff]/50 px-6 py-8 text-center">
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.noAccountTitle}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{copy.noAccountLead}</p>
        <Link
          href={localizePublicHref("/signup", locale)}
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-[#005B96]/30 bg-white px-6 py-2.5 text-sm font-semibold text-[#005B96] hover:bg-[#005B96]/5"
        >
          {copy.createAccount}
        </Link>
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        {copy.b2bNote}{" "}
        <Link href={localizePublicHref("/firmy", locale)} className="text-[#005B96] underline">
          /firmy
        </Link>
        . {copy.contact}:{" "}
        <Link href={localizePublicHref("/kontakt", locale)} className="text-[#005B96] underline">
          {copy.contact}
        </Link>
        .
      </p>
    </div>
  );
}
