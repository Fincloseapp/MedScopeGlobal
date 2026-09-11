"use client";

import { useState } from "react";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import type { ExchangePlan } from "@/lib/exchange/types";

export function ExchangePlanSwitcher({
  locale,
  current,
  activateLabel,
  demoLabel,
}: {
  locale: string;
  current: ExchangePlan;
  activateLabel: string;
  demoLabel: string;
}) {
  const [busy, setBusy] = useState<ExchangePlan | null>(null);
  const plans: ExchangePlan[] = ["basic", "pro", "enterprise"];

  async function activate(plan: ExchangePlan) {
    setBusy(plan);
    try {
      await fetch("/api/exchange/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      window.location.href = localizePublicHref(`/exchange/dashboard?as=${plan}`, locale);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="self-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{demoLabel}</span>
      {plans.map((plan) => (
        <button
          key={plan}
          type="button"
          disabled={busy !== null}
          onClick={() => void activate(plan)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
            current === plan ? "bg-[#005B96] text-white" : "border border-[#cfe1f3] bg-white text-[#021d33]"
          }`}
        >
          {busy === plan ? "…" : `${activateLabel} ${plan}`}
        </button>
      ))}
    </div>
  );
}
