import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import type { StoredNudge } from "@/lib/v38/conversion-engine";
import { getPaywallPreviewText } from "@/lib/monetization/paywall-preview";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

type Props = {
  copy: StoredNudge;
  teaserHtml?: string;
  title?: string;
  locale?: string | null;
};

function gateFooter(locale?: string | null) {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "de") {
    return {
      trial: `${VIP_TRIAL_DAYS} Tage zum Testen — jederzeit kündbar`,
      haveAccount: "Schon ein Konto?",
      signIn: "Anmelden",
      compare: "Tarife vergleichen",
    };
  }
  if (primary === "fr") {
    return {
      trial: `${VIP_TRIAL_DAYS} jours d’essai — résiliable à tout moment`,
      haveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      compare: "Comparer les formules",
    };
  }
  if (primary !== "cs") {
    return {
      trial: `${VIP_TRIAL_DAYS}-day trial — cancel anytime`,
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      compare: "Compare plans",
    };
  }
  return {
    trial: `${VIP_TRIAL_DAYS} dní zkušební verze — zrušíte kdykoli`,
    haveAccount: "Již máte účet?",
    signIn: "Přihlásit se",
    compare: "Srovnání tarifů",
  };
}

/** Paywall gate with content teaser — VIP or Redakce copy is passed in. */
export function ArticleConversionGate({ copy, teaserHtml, title, locale }: Props) {
  const teaserText = teaserHtml ? getPaywallPreviewText(teaserHtml) : null;
  const footer = gateFooter(locale);

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
          <p className="text-sm font-medium text-emerald-700">{footer.trial}</p>
        </div>
        <Button asChild size="lg" className="bg-[#005B96] hover:bg-[#004a7a]">
          <Link href={copy.ctaHref || "/predplatne"}>
            <Crown className="mr-2 h-4 w-4" />
            {copy.ctaLabel || footer.trial}
          </Link>
        </Button>
        <p className="text-xs text-slate-500">
          {footer.haveAccount}{" "}
          <Link href="/account" className="text-[#005B96] underline">
            {footer.signIn}
          </Link>
          {" · "}
          <Link href="/predplatne" className="text-[#005B96] underline">
            {footer.compare}
          </Link>
        </p>
      </div>
    </div>
  );
}
