import { Sparkles } from "lucide-react";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

export function SubscriptionTrialBanner() {
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
          Zkušební verze zdarma
        </span>
        <p className="font-display text-3xl font-bold sm:text-4xl">
          {VIP_TRIAL_DAYS} dní zdarma na všechny tarify
        </p>
        <p className="max-w-2xl text-sm text-white/90 sm:text-base">
          Vyzkoušejte plný přístup ke všem funkcím bez rizika. Platbu kartou zadáte až po skončení
          zkušební doby — kdykoli zrušíte v účtu.
        </p>
      </div>
    </div>
  );
}
