import { Sparkles } from "lucide-react";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";
import { subscriptionProductId } from "@/lib/v27/config";

export function SubscriptionTrialBanner({
  locale = "cs",
  region,
  returnPath,
}: {
  locale?: string;
  region?: string | null;
  returnPath?: string;
}) {
  const copy = getSubscribeCopy(locale, region);
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#005B96]/25 bg-gradient-to-r from-[#005B96] via-[#0077c2] to-[#005B96] px-6 py-8 text-center text-white shadow-lg"
      aria-label={copy.bannerKicker}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {copy.bannerKicker}
        </span>
        <p className="font-display text-3xl font-bold sm:text-4xl">{copy.bannerTitle}</p>
        <p className="max-w-2xl text-sm text-white/90 sm:text-base">{copy.bannerLead}</p>
        <div className="mt-2 w-full max-w-md">
          <V27CheckoutButton
            kind="subscription"
            productId={subscriptionProductId("public", "month")}
            locale={locale}
            returnPath={returnPath}
            label={copy.bannerPayCta}
            busyLabel={copy.bannerPayBusy}
            icon
            className="h-12 w-full rounded-full bg-white text-base font-semibold text-[#005B96] shadow-lg hover:bg-[#f4f9ff]"
            errorClassName="mt-2 text-sm text-amber-100"
          />
        </div>
        <p className="text-xs text-white/80">{copy.billedNow} · {copy.cancelAnytime}</p>
      </div>
    </section>
  );
}
