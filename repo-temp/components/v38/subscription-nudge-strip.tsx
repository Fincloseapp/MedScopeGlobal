"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StoredNudge } from "@/lib/v38/conversion-engine";

const DISMISS_KEY = "medscope-v38-nudge-dismissed";

type Props = {
  copy: StoredNudge;
};

/** v38 — dismissible subscription strip below header */
export function SubscriptionNudgeStrip({ copy }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="relative border-b border-[#005B96]/15 bg-gradient-to-r from-[#e8f4fc] via-white to-[#e8f4fc] dark:from-[#005B96]/10 dark:via-slate-950 dark:to-[#005B96]/10"
      role="complementary"
      aria-label="Nabídka předplatného"
    >
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            {copy.eyebrow}
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#021d33] dark:text-slate-100">
            {copy.headline}
          </p>
          <p className="hidden text-xs text-slate-600 dark:text-slate-400 sm:block">{copy.body}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {copy.hint ? (
            <span className="hidden text-xs text-slate-500 md:inline">{copy.hint}</span>
          ) : null}
          <Button asChild size="sm" className="h-8 bg-[#005B96] hover:bg-[#004a7a]">
            <Link href={copy.ctaHref}>{copy.ctaLabel}</Link>
          </Button>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Skrýt nabídku"
            onClick={() => {
              try {
                sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {
                /* ignore */
              }
              setVisible(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
