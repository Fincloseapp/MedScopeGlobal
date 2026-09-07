"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { readAiRefFromDocumentCookie } from "@/lib/growth/ai-ref-cookie";
import { getCheckoutButtonCopy, readerCheckoutError } from "@/lib/i18n/checkout-chrome";

type Props = {
  label?: string;
  href?: string;
  className?: string;
  compact?: boolean;
  locale?: string;
};

/** Header pill: Editorial starts Stripe year; student/other stay a link. */
export function NavSubscribeCta({
  label = "Otevřít tarif Redakce",
  href = "/predplatne#public",
  className,
  compact = false,
  locale,
}: Props) {
  const editorial = href.includes("#public");
  const [loading, setLoading] = useState(false);
  const chrome = getCheckoutButtonCopy(locale);

  async function startYearCheckout() {
    setLoading(true);
    try {
      const aiRef = readAiRefFromDocumentCookie();
      const res = await fetch("/api/v27/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "subscription",
          productId: "public-year",
          ...(locale ? { locale } : {}),
          ...(aiRef ? { aiRef } : {}),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; enabled?: boolean };
      if (res.status === 503 && data.enabled === false) throw new Error(chrome.stripeMissing);
      if (!res.ok) throw new Error(readerCheckoutError(locale, data.error));
      if (!data.url) throw new Error(chrome.stripeMissing);
      window.location.href = data.url;
    } catch {
      window.location.href = href;
    } finally {
      setLoading(false);
    }
  }

  const pill = cn(
    "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold transition",
    "bg-[#005B96] text-white shadow-sm hover:bg-[#004a7a]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005B96]",
    compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
    className
  );

  if (!editorial) {
    return (
      <Link href={href} className={pill}>
        <Sparkles className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => void startYearCheckout()} disabled={loading} className={pill}>
      <Sparkles className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {loading ? chrome.busy : label}
    </button>
  );
}
