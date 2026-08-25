"use client";

import { useState } from "react";
import Link from "next/link";
import { Coins, Crown } from "lucide-react";
import {
  ARTICLE_TIP_TIERS,
  formatTipAmount,
  VIP_PRICING,
} from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  articleSlug: string;
  articleTitle: string;
  authorName?: string;
  locale?: GlobalLocaleCode;
};

export function ArticleTringeltTip({
  articleSlug,
  articleTitle,
  authorName,
  locale = "cs",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const tiers = ARTICLE_TIP_TIERS[locale] ?? ARTICLE_TIP_TIERS.cs;
  const vip = VIP_PRICING[locale] ?? VIP_PRICING.cs;

  const zeroDecimal =
    locale === "ja" || locale === "ko" || locale === "vi" || locale === "id" || locale === "hu";

  const tip = async (amountMinor: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ecosystem/article-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountMinor,
          currency: tiers.currency,
          articleSlug,
          articleTitle,
          locale,
        }),
      });
      if (res.status === 503) {
        setDisabled(true);
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  const submitCustom = () => {
    const parsed = parseFloat(customAmount);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    const minor = zeroDecimal ? Math.round(parsed) : Math.round(parsed * 100);
    tip(minor);
  };

  if (disabled) {
    return (
      <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Tringelt momentálně není k dispozici.
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-5">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-[#021d33]">
          Podpořit autora{authorName ? ` (${authorName})` : ""} · Tringelt
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        Volitelný mikro-příspěvek — jako spropitné v restauraci. Děkujeme redakci.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tiers.amounts.map((amount) => (
          <button
            key={amount}
            type="button"
            disabled={loading}
            onClick={() => tip(amount)}
            className="rounded-full border border-amber-300/80 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            {formatTipAmount(amount, locale)}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={zeroDecimal ? tiers.minAmount : tiers.minAmount / 100}
            step={zeroDecimal ? 1 : 0.5}
            placeholder="Vlastní"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-16 rounded-full border border-amber-300/80 px-2 py-1 text-xs"
          />
          <button
            type="button"
            disabled={loading || !customAmount}
            onClick={submitCustom}
            className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {tiers.symbol}
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-white/60 p-3">
        <Crown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p className="text-xs text-slate-600">
          Podpořte redakci a získejte VIP longevity protokoly —{" "}
          <Link href="/vip/protokoly" className="font-medium text-amber-700 hover:underline">
            {vip.label}
          </Link>
        </p>
      </div>
    </div>
  );
}
