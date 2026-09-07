"use client";

import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { editorialPayLabels } from "@/lib/editorial/pay-labels";
import { subscriptionProductId } from "@/lib/v27/config";

type Props = {
  locale?: string | null;
  className?: string;
};

/** Redakce Stripe — roční první, pak měsíc. */
export function EditorialPayButtons({ locale, className }: Props) {
  const loc = locale ?? "cs";
  const pay = editorialPayLabels(loc);
  return (
    <div className={className ?? "flex w-full max-w-sm flex-col gap-2"}>
      <V27CheckoutButton
        kind="subscription"
        productId={subscriptionProductId("public", "year")}
        locale={loc}
        label={pay.year}
      />
      <V27CheckoutButton
        kind="subscription"
        productId={subscriptionProductId("public", "month")}
        locale={loc}
        label={pay.month}
        className="w-full border border-[#005B96]/30 bg-white text-[#005B96] hover:bg-[#f0f7ff]"
      />
    </div>
  );
}
