"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { V27CheckoutKind } from "@/lib/v27/stripe-products";

type Props = {
  kind: V27CheckoutKind;
  productId: string;
  label?: string;
  className?: string;
};

export function V27CheckoutButton({ kind, productId, label = "Koupit", className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v27/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, productId }),
      });
      const data = await res.json();
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

  return (
    <div>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className={className ?? "w-full bg-[#005B96] hover:bg-[#004a7a]"}
      >
        {loading ? "Načítám…" : label}
      </Button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
