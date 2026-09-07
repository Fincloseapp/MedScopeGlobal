import Link from "next/link";
import { EditorialPayButtons } from "@/components/subscription/editorial-pay-buttons";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { editorialMonthlyCharge } from "@/lib/editorial/pricing";
import { getServerRegion } from "@/lib/i18n/server-locale";

type Props = {
  locale?: string;
  returnPath?: string;
};

/** Soft public-plan trial after a free article. Not a VIP / paywall gate. */
export async function ArticleSubscribeNudge({ locale = "cs", returnPath }: Props) {
  const copy = getRevenueCopy(locale);
  const region = await getServerRegion();
  const price = editorialMonthlyCharge(locale, region);
  const href = localizePublicHref("/predplatne#public", locale);

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
      <div className="mt-3 flex flex-col gap-3">
        <EditorialPayButtons locale={locale} returnPath={returnPath} />
        <div className="flex flex-wrap items-center gap-3">
          <Link href={href} className="text-sm font-medium text-[#005B96] hover:underline">
            {copy.subscribeCta}
          </Link>
          <p className="text-xs text-slate-500">{copy.subscribeHint}</p>
        </div>
      </div>
    </section>
  );
}
