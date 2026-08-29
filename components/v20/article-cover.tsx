"use client";

import Image from "next/image";
import { getArticleCoverLabel, getArticleCoverStyles } from "@/lib/utils/article-visuals";
import { isBannedCoverUrl, resolveEditorialCover } from "@/lib/editorial/image-policy";

type Props = {
  title: string;
  category?: string | null;
  coverUrl?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publicTopic?: string | null;
  priority?: boolean;
  className?: string;
};

/** v20 — WebP-optimized cover with fixed 16:10 ratio and gradient fallback */
export function V20ArticleCover({
  title,
  category,
  coverUrl,
  slug,
  excerpt,
  publicTopic,
  priority = false,
  className = "",
}: Props) {
  const coverStyles = getArticleCoverStyles(title, category ?? undefined);
  const coverMeta = getArticleCoverLabel(title, category ?? undefined);
  const gated = resolveEditorialCover({
    coverUrl: coverUrl && !isBannedCoverUrl(coverUrl) ? coverUrl : null,
    title,
    category,
    slug,
    excerpt,
    public_topic: publicTopic,
  });
  const safeCover = gated && !isBannedCoverUrl(gated) ? gated : null;

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-slate-100 ${className}`}
    >
      {safeCover ? (
        <>
          <Image
            src={safeCover}
            alt={title}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0" style={coverStyles}>
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
              {category ?? "Odborný článek"}
            </p>
            <p className="mt-1 line-clamp-2 text-lg font-semibold leading-tight">
              {coverMeta.shortTitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
