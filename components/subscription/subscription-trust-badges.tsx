import Link from "next/link";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

const ICONS = [CreditCard, ShieldCheck, Lock] as const;

export function SubscriptionTrustBadges({ locale = "cs" }: { locale?: string }) {
  const copy = getSubscribeCopy(locale);
  return (
    <section aria-label={copy.trustAria} className="mt-16">
      <h2 className="text-center font-display text-2xl font-semibold text-[#021d33]">
        {copy.trustTitle}
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {copy.trust.map((badge, index) => {
          const Icon = ICONS[index] ?? CreditCard;
          const inner = (
            <>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#005B96]/10 text-[#005B96]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-[#021d33]">{badge.title}</p>
                <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
              </div>
            </>
          );

          if (index === 1) {
            return (
              <Link
                key={badge.title}
                href={localizePublicHref("/privacy", locale)}
                className="flex gap-4 rounded-2xl border border-[#005B96]/15 bg-white p-5 shadow-sm transition hover:border-[#005B96]/30 hover:shadow-md"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={badge.title}
              className="flex gap-4 rounded-2xl border border-[#005B96]/15 bg-white p-5 shadow-sm"
            >
              {inner}
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        Powered by{" "}
        <span className="font-semibold text-[#635bff]">Stripe</span>
        {" · "}
        <Link href={localizePublicHref("/privacy", locale)} className="text-[#005B96] underline">
          {copy.privacy}
        </Link>
        {" · "}
        <Link href={localizePublicHref("/terms", locale)} className="text-[#005B96] underline">
          {copy.terms}
        </Link>
      </p>
    </section>
  );
}
