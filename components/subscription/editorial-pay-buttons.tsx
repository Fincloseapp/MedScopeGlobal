"use client";

import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { editorialPayLabels } from "@/lib/editorial/pay-labels";

type Props = {
  locale?: string | null;
  className?: string;
  returnPath?: string;
  hideMonth?: boolean;
};

/** Redakce Stripe — roční první, pak měsíc. */
export function EditorialPayButtons({ locale, className, returnPath, hideMonth }: Props) {
  const loc = locale ?? "cs";
  const pay = editorialPayLabels(loc);
  return (
    <div className={className ?? "flex w-full max-w-sm flex-col gap-2"}>
      <V27CheckoutButton
        kind="subscription"
        productId="public-year"
        locale={loc}
        label={pay.year}
        returnPath={returnPath}
      />
      {hideMonth ? null : (
        <V27CheckoutButton
          kind="subscription"
          productId="public-month"
          locale={loc}
          label={pay.month}
          returnPath={returnPath}
          className="w-full border border-[#005B96]/30 bg-white text-[#005B96] hover:bg-[#f0f7ff]"
        />
      )}
    </div>
  );
}
