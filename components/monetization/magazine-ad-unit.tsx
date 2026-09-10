"use client";

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { ADSENSE_SLOT_IN_ARTICLE } from "@/lib/monetization/adsense";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";

/**
 * Owner in-article unit (slot 2911384114). Use inside article bodies only.
 * Listing / homepage pages use official Auto ads from AdSenseHead — do not
 * mount this there or the in-article slot is asked to fill as display.
 */
export function MagazineAdUnit({
  locale = "cs",
  className = "",
}: {
  locale?: string;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-3xl px-4 sm:px-0 ${className}`}>
      <GlobalAdSlot
        placement="in-article"
        layout="in-article"
        slotId={ADSENSE_SLOT_IN_ARTICLE}
        locale={(locale as GlobalLocaleCode) ?? "cs"}
      />
    </div>
  );
}
