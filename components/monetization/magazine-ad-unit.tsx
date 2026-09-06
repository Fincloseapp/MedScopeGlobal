"use client";

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { ADSENSE_SLOT_IN_ARTICLE } from "@/lib/monetization/adsense";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";

/**
 * Visible ViaLongeVita AdSense unit — owner slot 2911384114.
 * Use on the public magazine (homepage + articles), never on apps / students / admin.
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
        placement="in-content"
        layout="auto"
        slotId={ADSENSE_SLOT_IN_ARTICLE}
        locale={(locale as GlobalLocaleCode) ?? "cs"}
      />
    </div>
  );
}
