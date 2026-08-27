import Link from "next/link";
import { Heart } from "lucide-react";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { ARTICLE_TIP_COPY, tipLocale } from "@/lib/ecosystem/tip-copy";

type Props = {
  locale?: GlobalLocaleCode;
  articleSlug: string;
};

/**
 * Soft tip nudge under hero art.
 * Tip-only — VIP / předplatné never share this line (tips ≠ membership).
 */
export function ArticleImageSupportNudge({ locale = "cs", articleSlug }: Props) {
  const tip = ARTICLE_TIP_COPY[tipLocale(locale)];

  return (
    <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
      {tip.nudgeLine}{" "}
      <Link
        href={`#article-tip-${articleSlug}`}
        className="text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-[#005B96] hover:decoration-[#005B96]/40"
      >
        {tip.nudgeTip}
      </Link>
      <Heart className="mx-0.5 inline h-3 w-3 text-[#005B96]/70" aria-hidden />
    </p>
  );
}
