"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { V27CheckoutKind } from "@/lib/v27/stripe-products";
import { readAiRefFromDocumentCookie } from "@/lib/growth/ai-ref-cookie";
import { getCheckoutButtonCopy, readerCheckoutError } from "@/lib/i18n/checkout-chrome";

type Props = {
  kind: V27CheckoutKind;
  productId: string;
  label?: string;
  className?: string;
  locale?: string;
  gift?: boolean;
  icon?: boolean;
  busyLabel?: string;
  errorClassName?: string;
};

export function V27CheckoutButton({
  kind,
  productId,
  label = "Přejít na Stripe pokladnu",
  className,
  locale,
  gift = false,
  icon,
  busyLabel,
  errorClassName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chrome = getCheckoutButtonCopy(locale);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      let userId: string | undefined;
      try {
        const ctxRes = await fetch("/api/v22/reader-context", {
          credentials: "same-origin",
        });
        if (ctxRes.ok) {
          const ctx = (await ctxRes.json()) as { user?: { id?: string } | null };
          if (ctx.user?.id) userId = ctx.user.id;
        }
      } catch {
        // Guest checkout still allowed; webhook may resolve later.
      }

      const aiRef = readAiRefFromDocumentCookie();
      const res = await fetch("/api/v27/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          productId,
          ...(userId ? { userId } : {}),
          ...(locale ? { locale } : {}),
          ...(gift ? { gift: true } : {}),
          ...(aiRef ? { aiRef } : {}),
        }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        enabled?: boolean;
      };
      if (res.status === 503 && data.enabled === false) {
        throw new Error(chrome.stripeMissing);
      }
      if (!res.ok) throw new Error(readerCheckoutError(locale, data.error));
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(chrome.stripeMissing);
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : chrome.generic;
      setError(readerCheckoutError(locale, raw));
    } finally {
      setLoading(false);
    }
  }

  const isPrimary = !className?.includes("bg-white");
  const showIcon = icon ?? isPrimary;

  return (
    <div>
      <Button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={className ?? "w-full bg-[#005B96] hover:bg-[#004a7a]"}
      >
        {loading ? (
          busyLabel ?? chrome.busy
        ) : (
          <>
            {showIcon ? <CreditCard className="mr-2 h-4 w-4" aria-hidden /> : null}
            {label}
          </>
        )}
      </Button>
      {error && <p className={errorClassName ?? "mt-2 text-xs text-red-600"}>{error}</p>}
    </div>
  );
}
