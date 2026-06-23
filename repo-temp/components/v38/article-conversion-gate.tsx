import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredNudge } from "@/lib/v38/conversion-engine";
import { getPaywallPreviewText, VIP_TRIAL_DAYS } from "@/lib/vip";

type Props = {
  copy: StoredNudge;
  teaserHtml?: string;
  title?: string;
};

/** v38 — paywall gate with content teaser and "pro váš zájem" framing */
export function ArticleConversionGate({ copy, teaserHtml, title }: Props) {
  const teaserText = teaserHtml ? getPaywallPreviewText(teaserHtml) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#005B96]/20 bg-gradient-to-b from-white to-[#f0f7ff] shadow-sm dark:from-slate-900 dark:to-[#005B96]/5">
      {teaserText ? (
        <div className="relative border-b border-[#005B96]/10 px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            {copy.hint ?? "Náhled článku"}
          </p>
          {title ? (
            <p className="mt-1 font-display text-lg font-semibold text-[#021d33] dark:text-slate-100">
              {title}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {teaserText}…
          </p>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f0f7ff] to-transparent dark:from-[#005B96]/5"
            aria-hidden
          />
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#005B96]/10 text-[#005B96]">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <div className="max-w-md space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            {copy.eyebrow}
          </p>
          <p className="font-display text-xl font-semibold text-[#021d33] dark:text-slate-100">
            {copy.headline}
          </p>
          <p className="text-sm text-muted-foreground">{copy.body}</p>
          <p className="text-sm font-medium text-emerald-700">
            {VIP_TRIAL_DAYS} dní zkušební verze zdarma — vyzkoušejte bez rizika
          </p>
        </div>
        <Button asChild size="lg" className="bg-[#005B96] hover:bg-[#004a7a]">
          <Link href={copy.ctaHref || "/predplatne"}>
            <Crown className="mr-2 h-4 w-4" />
            {copy.ctaLabel || `Začít ${VIP_TRIAL_DAYS}denní trial zdarma`}
          </Link>
        </Button>
        <p className="text-xs text-slate-500">
          Již máte účet?{" "}
          <Link href="/account" className="text-[#005B96] underline">
            Přihlásit se
          </Link>
          {" · "}
          <Link href="/predplatne" className="text-[#005B96] underline">
            Srovnání tarifů
          </Link>
        </p>
      </div>
    </div>
  );
}
