"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Heart, Share2, BookmarkPlus, Crown } from "lucide-react";
import { formatDonationAmount } from "@/lib/ecosystem/monetization";
import { paymentTiersForUser } from "@/lib/i18n/payment-currency";
import { getArticleChrome } from "@/lib/i18n/article-chrome";
import { DONATION_COPY, ARTICLE_TIP_COPY, tipLocale } from "@/lib/ecosystem/tip-copy";
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
  const [showSuccess, setShowSuccess] = useState(false);
  const tiers = paymentTiersForUser(locale);
  const copy = DONATION_COPY[tipLocale(locale)];
  const zeroDecimal = new Set(["jpy", "krw", "vnd", "idr", "huf"]).has(tiers.currency);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("donated") !== "1") return;
    setShowSuccess(true);
    url.searchParams.delete("donated");
    const qs = url.searchParams.toString();
    window.history.replaceState(
      {},
      "",
      qs ? `${url.pathname}?${qs}` : url.pathname
    );
  }, []);

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
          locale,
        }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        enabled?: boolean;
        detail?: string;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 503 && data.enabled === false) {
        setUnavailable(true);
        return;
      }
      setError(
        data.error ??
          data.detail ??
          "Platbu se nepodařilo spustit. Zkuste to prosím znovu."
      );
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
        {copy.unavailable}
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-5">
      {showSuccess ? (
        <p
          className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          {copy.success}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        <p className="font-semibold text-[#021d33]">{copy.title(authorName)}</p>
      </div>
      <p className="mt-1 text-sm text-slate-600">{copy.blurb}</p>
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
            placeholder={ARTICLE_TIP_COPY[tipLocale(locale)].custom}
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
      {loading ? <p className="mt-2 text-xs text-slate-500">{copy.redirecting}</p> : null}
    </div>
  );
}

export function SaveToMediFlowButton({
  articleSlug,
  articleTitle,
  locale = "cs",
}: {
  articleSlug: string;
  articleTitle: string;
  locale?: string;
}) {
  const [saved, setSaved] = useState(false);
  const chrome = getArticleChrome(locale);

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
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-[#005B96] hover:underline"
    >
      <BookmarkPlus className="h-3.5 w-3.5" />
      {saved ? chrome.saved : chrome.save}
    </Link>
  );
}

export function ArticleShareButton({
  title,
  slug,
  locale = "cs",
}: {
  title: string;
  slug: string;
  locale?: string;
}) {
  const chrome = getArticleChrome(locale);
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
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-2 hover:text-[#005B96] hover:underline"
    >
      <Share2 className="h-3.5 w-3.5" />
      {chrome.share}
    </button>
  );
}

/**
 * Soft VIP Longevity CTA for dedicated VIP / marketing surfaces.
 * Do not mount on open article footers next to tip/donate — that confuses
 * voluntary support with paid předplatné.
 */
export function VipUpgradeNudge({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  const isEn = locale === "en" || locale === "en-US";
  return (
    <aside className="my-10 border-t border-slate-200 pt-8">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-[#005B96]" aria-hidden />
        <p className="font-display text-lg font-semibold text-[#021d33]">
          {isEn ? "VIP Longevity protocols" : "VIP Longevity protokoly"}
        </p>
      </div>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
        {isEn
          ? "A separate paid subscription with 10 science-backed protocols — not a tip or donation on an article."
          : "Samostatné placené předplatné s 10 vědecky podloženými protokoly — nejde o příspěvek ani dar u článku."}
      </p>
      <Link
        href="/vip/protokoly"
        className="mt-4 inline-block bg-[#005B96] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a7a]"
      >
        {isEn ? "Explore protocols" : "Prozkoumat protokoly"}
      </Link>
    </aside>
  );
}
