"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Heart, Share2, BookmarkPlus, Crown } from "lucide-react";
import { DONATION_TIERS, formatDonationAmount } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { MEDIFLOW_STORAGE_KEY, demoMediFlowDashboard } from "@/lib/mediflow/types";

type Props = {
  articleSlug: string;
  articleTitle: string;
  authorName?: string;
  locale?: GlobalLocaleCode;
};

export function AuthorDonationButton({
  articleSlug,
  articleTitle,
  authorName,
  locale = "cs",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const tiers = DONATION_TIERS[locale] ?? DONATION_TIERS.cs;
  const zeroDecimal =
    locale === "ja" || locale === "ko" || locale === "vi" || locale === "id" || locale === "hu";

  const donate = async (amountMinor: number) => {
    if (!amountMinor || amountMinor < 1) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ecosystem/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountMinor,
          currency: tiers.currency,
          articleSlug,
          articleTitle,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; enabled?: boolean };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 503 && data.enabled === false) {
        setUnavailable(true);
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
    donate(zeroDecimal ? Math.round(parsed) : Math.round(parsed * 100));
  };

  if (unavailable) {
    return (
      <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Dary momentálně nejsou k dispozici — Stripe není nakonfigurován (API 503).
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-5">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        <p className="font-semibold text-[#021d33]">
          Podpořit {authorName ? `autora (${authorName})` : "autora"} · Dar
        </p>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Mikro-dar pomůže pokračovat v tvorbě kvalitního obsahu.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tiers.amounts.map((amount) => (
          <button
            key={amount}
            type="button"
            disabled={loading}
            onClick={() => donate(amount)}
            className="rounded-full border border-rose-300 bg-white px-4 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            {formatDonationAmount(amount, locale)}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="number"
            placeholder="Vlastní"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-20 rounded-full border border-rose-300 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={loading || !customAmount}
            onClick={submitCustom}
            className="rounded-full bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            {tiers.symbol}
          </button>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600" role="alert">{error}</p> : null}
      {loading ? <p className="mt-2 text-xs text-slate-500">Přesměrování na Stripe…</p> : null}
    </div>
  );
}

export function SaveToMediFlowButton({ articleSlug, articleTitle }: { articleSlug: string; articleTitle: string }) {
  const [saved, setSaved] = useState(false);

  const saveLocal = () => {
    try {
      const raw = localStorage.getItem(MEDIFLOW_STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : demoMediFlowDashboard();
      const exists = data.savedArticles?.some((a: { articleSlug: string }) => a.articleSlug === articleSlug);
      if (!exists) {
        data.savedArticles = [
          { id: `a-${Date.now()}`, articleSlug, articleTitle, savedAt: new Date().toISOString() },
          ...(data.savedArticles ?? []),
        ];
        localStorage.setItem(MEDIFLOW_STORAGE_KEY, JSON.stringify(data));
      }
      setSaved(true);
    } catch {
      /* ignore */
    }
  };

  const save = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/mediflow/saved-articles", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleSlug, articleTitle }),
      });
      if (res.ok) {
        setSaved(true);
        window.location.href = `/app/mediflow?saved=${articleSlug}`;
        return;
      }
      if (res.status === 401) {
        saveLocal();
        window.location.href = `/app/mediflow?saved=${articleSlug}`;
        return;
      }
    } catch {
      saveLocal();
      window.location.href = `/app/mediflow?saved=${articleSlug}`;
    }
  };

  return (
    <Link
      href={`/app/mediflow?saved=${articleSlug}`}
      onClick={save}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
    >
      <BookmarkPlus className="h-3.5 w-3.5" />
      {saved ? "Uloženo v MediFlow" : "Uložit do MediFlow"}
    </Link>
  );
}

export function ArticleShareButton({ title, slug }: { title: string; slug: string }) {
  const share = async () => {
    const url = `${window.location.origin}/article/${slug}`;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      <Share2 className="h-3.5 w-3.5" />
      Sdílet
    </button>
  );
}

export function VipUpgradeNudge({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  return (
    <div className="my-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-500" />
        <p className="font-semibold text-[#021d33]">VIP Longevity protokoly</p>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        10 vědecky podložených protokolů pro dlouhověkost. Export do PDF, MediFlow sync.
      </p>
      <Link
        href="/vip/protokoly"
        className="mt-3 inline-block rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400"
      >
        Prozkoumat protokoly →
      </Link>
    </div>
  );
}
