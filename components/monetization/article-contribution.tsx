"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  ARTICLE_TIP_TIERS,
  DONATION_TIERS,
  formatDonationAmount,
  formatTipAmount,
} from "@/lib/ecosystem/monetization";
import {
  ARTICLE_TIP_COPY,
  DONATION_COPY,
  tipLocale,
} from "@/lib/ecosystem/tip-copy";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  articleSlug: string;
  articleTitle: string;
  authorName?: string;
  locale?: GlobalLocaleCode;
};

const ZERO_DECIMAL = new Set(["ja", "ko", "vi", "id", "hu"]);

/**
 * Unified article support: Příspěvek (tip) + Dar (donate).
 * Never claims tips unlock VIP / membership / předplatné.
 * Article pages intentionally omit VIP / tariff footers next to this block.
 */
export function ArticleContribution({
  articleSlug,
  articleTitle,
  authorName,
  locale = "cs",
}: Props) {
  const [loading, setLoading] = useState<"tip" | "donate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [customTip, setCustomTip] = useState("");
  const [customDonate, setCustomDonate] = useState("");
  const [showSuccess, setShowSuccess] = useState<"tip" | "donate" | null>(null);

  const tipTiers = ARTICLE_TIP_TIERS[locale] ?? ARTICLE_TIP_TIERS.cs;
  const donateTiers = DONATION_TIERS[locale] ?? DONATION_TIERS.cs;
  const tipCopy = ARTICLE_TIP_COPY[tipLocale(locale)];
  const donateCopy = DONATION_COPY[tipLocale(locale)];
  const zeroDecimal = ZERO_DECIMAL.has(locale);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("tip") === "1") {
      setShowSuccess("tip");
      url.searchParams.delete("tip");
    } else if (url.searchParams.get("donated") === "1") {
      setShowSuccess("donate");
      url.searchParams.delete("donated");
    } else {
      return;
    }
    const qs = url.searchParams.toString();
    window.history.replaceState(
      {},
      "",
      qs ? `${url.pathname}?${qs}` : url.pathname
    );
  }, []);

  const checkout = async (
    kind: "tip" | "donate",
    amountMinor: number,
    currency: string
  ) => {
    if (!amountMinor || amountMinor < 1) return;
    setLoading(kind);
    setError(null);
    try {
      const path =
        kind === "tip" ? "/api/ecosystem/article-tip" : "/api/ecosystem/donate";
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountMinor,
          currency,
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
        setDisabled(true);
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
      setLoading(null);
    }
  };

  const toMinor = (raw: string) => {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed) || parsed <= 0) return 0;
    return zeroDecimal ? Math.round(parsed) : Math.round(parsed * 100);
  };

  if (disabled) {
    return (
      <section
        id={`article-tip-${articleSlug}`}
        className="article-contribute scroll-mt-24"
        aria-labelledby={`contribution-heading-${articleSlug}`}
      >
        <p className="text-sm text-slate-500">{tipCopy.unavailable}</p>
      </section>
    );
  }

  return (
    <section
      id={`article-tip-${articleSlug}`}
      className="article-contribute scroll-mt-24"
      aria-labelledby={`contribution-heading-${articleSlug}`}
    >
      {showSuccess ? (
        <p
          className="mb-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          {showSuccess === "tip" ? tipCopy.success : donateCopy.success}
        </p>
      ) : null}

      <div className="flex items-start gap-3">
        <Heart className="mt-1 h-5 w-5 shrink-0 text-[#005B96]" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2
            id={`contribution-heading-${articleSlug}`}
            className="font-display text-xl font-semibold tracking-tight text-[#021d33]"
          >
            {tipCopy.title(authorName)}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {tipCopy.blurb}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {tipCopy.clarifying}
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#005B96]">
                Příspěvek
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {tipTiers.amounts.map((amount) => (
                  <button
                    key={`tip-${amount}`}
                    type="button"
                    disabled={loading !== null}
                    onClick={() =>
                      void checkout("tip", amount, tipTiers.currency)
                    }
                    className="border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-[#021d33] transition hover:border-[#005B96] hover:text-[#005B96] disabled:opacity-50"
                  >
                    {formatTipAmount(amount, locale)}
                  </button>
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={
                      zeroDecimal
                        ? tipTiers.minAmount
                        : tipTiers.minAmount / 100
                    }
                    step={zeroDecimal ? 1 : 0.5}
                    placeholder={tipCopy.custom}
                    aria-label={`Příspěvek — ${tipCopy.custom}`}
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="w-20 border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={loading !== null || !customTip}
                    onClick={() => {
                      const minor = toMinor(customTip);
                      if (minor) void checkout("tip", minor, tipTiers.currency);
                    }}
                    className="bg-[#005B96] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#004a7a] disabled:opacity-50"
                  >
                    Přispět
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#005B96]">
                Darovat
              </p>
              <p className="mt-1 text-xs text-slate-500">{donateCopy.blurb}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {donateTiers.amounts.map((amount) => (
                  <button
                    key={`donate-${amount}`}
                    type="button"
                    disabled={loading !== null}
                    onClick={() =>
                      void checkout("donate", amount, donateTiers.currency)
                    }
                    className="border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-[#021d33] transition hover:border-[#005B96] hover:text-[#005B96] disabled:opacity-50"
                  >
                    {formatDonationAmount(amount, locale)}
                  </button>
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder={tipCopy.custom}
                    aria-label={`Darovat — ${tipCopy.custom}`}
                    value={customDonate}
                    onChange={(e) => setCustomDonate(e.target.value)}
                    className="w-20 border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={loading !== null || !customDonate}
                    onClick={() => {
                      const minor = toMinor(customDonate);
                      if (minor)
                        void checkout("donate", minor, donateTiers.currency);
                    }}
                    className="bg-[#021d33] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#0a3d5c] disabled:opacity-50"
                  >
                    Darovat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="mt-3 text-xs text-slate-500">{tipCopy.redirecting}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Legacy name — article tip UI now lives in ArticleContribution. */
export function ArticleTringeltTip(props: Props) {
  return <ArticleContribution {...props} />;
}

export const ArticleTip = ArticleContribution;
