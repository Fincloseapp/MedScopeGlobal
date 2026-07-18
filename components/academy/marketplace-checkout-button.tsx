"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  listingId: string;
  priceCzk: number;
  courseSlug?: string;
};

export function MarketplaceCheckoutButton({ listingId, priceCzk, courseSlug }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ listingId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          const next = courseSlug
            ? `/academy/courses/${courseSlug}`
            : "/academy/marketplace";
          window.location.href = `/login?next=${encodeURIComponent(next)}`;
          return;
        }
        setError(data.error ?? `Chyba (${res.status})`);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Stripe session bez URL");
    } catch {
      setError("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <Button
        type="button"
        size="sm"
        className="w-full bg-[#005B96] hover:bg-[#004a7a]"
        onClick={checkout}
        disabled={loading || priceCzk <= 0}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {loading ? "Přesměrování…" : `Koupit za ${priceCzk.toLocaleString("cs-CZ")} Kč`}
      </Button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
