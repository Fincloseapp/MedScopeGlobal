import Link from "next/link";
import { Heart } from "lucide-react";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  locale?: GlobalLocaleCode;
  articleSlug: string;
};

const COPY: Record<string, { line: string; tip: string; vip: string }> = {
  cs: {
    line: "Líbí se vám tento článek?",
    tip: "Podpořte redakci tringeltem",
    vip: "nebo prozkoumejte VIP protokoly",
  },
  en: {
    line: "Enjoying this article?",
    tip: "Support the editorial team with a tip",
    vip: "or explore VIP longevity protocols",
  },
};

export function ArticleImageSupportNudge({ locale = "cs", articleSlug }: Props) {
  const copy = COPY[locale === "en" || locale === "en-US" ? "en" : "cs"];

  return (
    <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
      {copy.line}{" "}
      <Link
        href={`#article-tip-${articleSlug}`}
        className="text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-amber-700 hover:decoration-amber-400"
      >
        {copy.tip}
      </Link>{" "}
      <Heart className="mx-0.5 inline h-3 w-3 text-amber-500/70" aria-hidden />{" "}
      {copy.vip}{" "}
      <Link
        href="/vip/protokoly"
        className="text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-[#005B96] hover:decoration-[#005B96]/40"
      >
        VIP
      </Link>
      .
    </p>
  );
}
