import Image from "next/image";
import Link from "next/link";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { resolveVerejnostCoverUrl } from "@/lib/verejnost/resolve-cover";
import { articleTopicLabel, verejnostDateLabel } from "@/lib/verejnost/helpers";

export function VerejnostArticleCard({
  article,
  variant = "default",
}: {
  article: DisplayArticle;
  variant?: "default" | "compact" | "interview";
}) {
  const href = `/verejnost/clanky/${article.slug}`;
  const image = resolveVerejnostCoverUrl(article);
  const dateLabel = verejnostDateLabel(article);
  const topicLabel = articleTopicLabel(article);
  const isInterview = article.public_topic === "rozhovory";

  if (variant === "compact") {
    return (
      <Link
        href={href}
        prefetch
        className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-md"
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image src={image} alt="" fill className="object-cover" sizes="96px" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">{topicLabel}</p>
          <h3 className="mt-0.5 line-clamp-2 font-semibold text-[#021d33] group-hover:text-[#005B96]">
            {article.title}
          </h3>
          {dateLabel ? <p className="mt-1 text-xs text-slate-400">{dateLabel}</p> : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      prefetch
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-slate-100">
        <Image src={image} alt="" fill className="object-cover" sizes="50vw" loading="lazy" />
        {variant === "interview" && isInterview ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-[#021d33]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            Rozhovor
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">{topicLabel}</p>
        <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-[#005B96]">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{article.excerpt}</p>
        ) : null}
        {dateLabel ? <p className="mt-2 text-xs text-slate-400">{dateLabel}</p> : null}
      </div>
    </Link>
  );
}
