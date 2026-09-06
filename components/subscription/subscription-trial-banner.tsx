import { Sparkles } from "lucide-react";
import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";

export function SubscriptionTrialBanner({ locale = "cs" }: { locale?: string }) {
  const copy = getSubscribeCopy(locale);
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#005B96]/25 bg-gradient-to-r from-[#005B96] via-[#0077c2] to-[#005B96] px-6 py-8 text-center text-white shadow-lg"
      role="status"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {copy.daysFree}
        </span>
        <p className="font-display text-3xl font-bold sm:text-4xl">{copy.daysFree}</p>
        <p className="max-w-2xl text-sm text-white/90 sm:text-base">{copy.choosePlanLead}</p>
      </div>
    </div>
  );
}
