"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { V27CheckoutKind } from "@/lib/v27/stripe-products";
import { readAiRefFromDocumentCookie } from "@/lib/growth/ai-ref-cookie";

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
        throw new Error("Stripe není nakonfigurován — nastavte STRIPE_SECRET_KEY na Workeru");
      }
      if (!res.ok) throw new Error(data.error ?? "Checkout selhal");
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe není nakonfigurován");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba");
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
          busyLabel ?? "Přesměrování na Stripe…"
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
