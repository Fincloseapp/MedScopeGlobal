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

const COPY: Record<
  "cs" | "en",
  {
    title: (author?: string) => string;
    blurb: string;
    custom: string;
    unavailable: string;
    vipLead: string;
    vipLink: string;
  }
> = {
  cs: {
    title: (author) => `Podpořit autora${author ? ` (${author})` : ""} · Tringelt`,
    blurb: "Volitelný mikro-příspěvek — jako spropitné. Pomáhá redakci VitaScope.",
    custom: "Vlastní",
    unavailable: "Tringelt momentálně není k dispozici — platební brána není nakonfigurována.",
    vipLead: "Podpořte redakci a získejte VIP longevity protokoly —",
    vipLink: "protokoly",
  },
  en: {
    title: (author) => `Support the author${author ? ` (${author})` : ""} · Tip`,
    blurb: "Optional micro-contribution — like a tip. Funds VitaScope editorial.",
    custom: "Custom",
    unavailable: "Tips are unavailable — payment gateway is not configured.",
    vipLead: "Support the desk and unlock VIP longevity protocols —",
    vipLink: "protocols",
  },
};

export function ArticleTringeltTip({
  articleSlug,
  articleTitle,
  authorName,
  locale = "cs",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const tiers = ARTICLE_TIP_TIERS[locale] ?? ARTICLE_TIP_TIERS.cs;
  const vip = VIP_PRICING[locale] ?? VIP_PRICING.cs;
  const copy = locale === "en" || locale === "en-US" ? COPY.en : COPY.cs;

  const zeroDecimal =
    locale === "ja" || locale === "ko" || locale === "vi" || locale === "id" || locale === "hu";

  const tip = async (amountMinor: number) => {
    if (!amountMinor || amountMinor < 1) return;
    setLoading(true);
    setError(null);
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
      const data = (await res.json()) as { url?: string; error?: string; enabled?: boolean };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 503 && data.enabled === false) {
        setDisabled(true);
        return;
      }
      setError(data.error ?? "Platbu se nepodařilo spustit. Zkuste to prosím znovu.");
    } catch {
      setError("Síťová chyba — zkontrolujte připojení a zkuste znovu.");
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
        {copy.unavailable}
      </div>
    );
  }

  return (
    <aside
      className="my-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-5"
      aria-labelledby={`tringelt-heading-${articleSlug}`}
    >
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-amber-600" aria-hidden />
        <p
          id={`tringelt-heading-${articleSlug}`}
          className="text-sm font-semibold text-[#021d33]"
        >
          {copy.title(authorName)}
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-600">{copy.blurb}</p>
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
            placeholder={copy.custom}
            aria-label={copy.custom}
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
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="mt-2 text-xs text-slate-500">Přesměrování na Stripe…</p> : null}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-white/60 p-3">
        <Crown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
        <p className="text-xs text-slate-600">
          {copy.vipLead}{" "}
          <Link href="/vip/protokoly" className="font-medium text-amber-700 hover:underline">
            {vip.label}
          </Link>{" "}
          ({copy.vipLink}).
        </p>
      </div>
    </aside>
  );
}
