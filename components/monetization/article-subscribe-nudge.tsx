import Link from "next/link";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { convertCzkToCharge } from "@/lib/i18n/payment-currency";
import { getServerRegion } from "@/lib/i18n/server-locale";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  locale?: string;
};

/** Soft public-plan trial after a free article. Not a VIP / paywall gate. */
export async function ArticleSubscribeNudge({ locale = "cs" }: Props) {
  const copy = getRevenueCopy(locale);
  const region = await getServerRegion();
  const price = convertCzkToCharge(99, locale as GlobalLocaleCode, region);
  const href = localizePublicHref("/predplatne?trial=1", locale);

  return (
    <section className="rounded-2xl border border-[#cfe1f3] bg-[#f7fbff] px-5 py-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
        {copy.subscribeKicker}
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold text-[#021d33]">
        {copy.subscribeTitle}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {copy.subscribeBody} {price.formatted}.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="inline-flex h-10 items-center rounded-full bg-[#005B96] px-4 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          {copy.subscribeCta}
        </Link>
        <p className="text-xs text-slate-500">{copy.subscribeHint}</p>
      </div>
    </section>
  );
}
