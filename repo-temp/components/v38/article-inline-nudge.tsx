import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredNudge } from "@/lib/v38/conversion-engine";

type Props = {
  copy: StoredNudge;
};

/** v38 — inline nudge after article content for non-VIP readers */
export function ArticleInlineNudge({ copy }: Props) {
  return (
    <aside
      className="mt-10 rounded-2xl border border-dashed border-[#005B96]/30 bg-[#f0f7ff]/60 p-6 dark:bg-[#005B96]/5"
      aria-label="Nabídka předplatného"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
        {copy.eyebrow}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33] dark:text-slate-100">
        {copy.headline}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{copy.body}</p>
      <Button asChild className="mt-4 bg-[#005B96] hover:bg-[#004a7a]">
        <Link href={copy.ctaHref}>
          {copy.ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </aside>
  );
}
