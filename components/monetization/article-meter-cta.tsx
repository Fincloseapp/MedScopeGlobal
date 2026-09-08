"use client";

import { V27CheckoutButton } from "@/components/v27/checkout-button";
import {
  articleMeterPriceLabel,
  getArticleMeterCopy,
} from "@/lib/monetization/article-meter-copy";

type Props = {
  locale?: string | null;
  returnPath?: string;
};

/** HN-style “read on” + colour-emphasised local price (25 Kč / €1 / $1 / £1). */
export function ArticleMeterCta({ locale, returnPath }: Props) {
  const loc = locale ?? "cs";
  const copy = getArticleMeterCopy(loc);
  const price = articleMeterPriceLabel(loc);

  return (
    <V27CheckoutButton
      kind="subscription"
      productId="public-month"
      locale={loc}
      returnPath={returnPath}
      icon={false}
      className="h-12 w-full bg-[#111827] text-base font-semibold text-white hover:bg-black"
      label={`${copy.continueReading} ${price}`}
      labelNode={
        <span className="inline-flex items-center gap-2">
          <span>{copy.continueReading}</span>
          <span className="rounded-md bg-[#ff2d2d] px-2.5 py-0.5 text-sm font-extrabold tracking-wide text-white shadow-[0_0_0_2px_rgba(255,45,45,0.25)]">
            {price}
          </span>
        </span>
      }
    />
  );
}