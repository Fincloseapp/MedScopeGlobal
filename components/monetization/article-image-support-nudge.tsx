import Link from "next/link";
import { Heart } from "lucide-react";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import {
  ARTICLE_TIP_COPY,
  VIP_CTA_COPY,
  tipLocale,
} from "@/lib/ecosystem/tip-copy";

type Props = {
  locale?: GlobalLocaleCode;
  articleSlug: string;
};

/** Soft tip nudge under hero art. VIP is a separate link — tip never grants membership. */
export function ArticleImageSupportNudge({ locale = "cs", articleSlug }: Props) {
  const lang = tipLocale(locale);
  const tip = ARTICLE_TIP_COPY[lang];
  const vip = VIP_CTA_COPY[lang];

  return (
    <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
      {tip.nudgeLine}{" "}
      <Link
        href={`#article-tip-${articleSlug}`}
        className="text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-amber-700 hover:decoration-amber-400"
      >
        {tip.nudgeTip}
      </Link>
      <Heart className="mx-0.5 inline h-3 w-3 text-amber-500/70" aria-hidden />
      <span className="mx-1 text-slate-300" aria-hidden>
        ·
      </span>
      <Link
        href="/vip/protokoly"
        className="text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-[#005B96] hover:decoration-[#005B96]/40"
      >
        {vip.nudgeExplore}
      </Link>
      .
    </p>
  );
}
