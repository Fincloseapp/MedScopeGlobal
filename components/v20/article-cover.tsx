"use client";

import { CoverImage } from "@/components/media/cover-image";
import { getArticleCoverLabel, getArticleCoverStyles } from "@/lib/utils/article-visuals";

type Props = {
  title: string;
  category?: string | null;
  coverUrl?: string | null;
  priority?: boolean;
  className?: string;
};

/** v20 — cover with native img (Cloudflare) and gradient fallback */
export function V20ArticleCover({
  title,
  category,
  coverUrl,
  className = "",
}: Props) {
  const coverStyles = getArticleCoverStyles(title, category ?? undefined);
  const coverMeta = getArticleCoverLabel(title, category ?? undefined);

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-slate-100 ${className}`}
    >
      {coverUrl ? (
        <>
          <CoverImage src={coverUrl} alt={title} className="absolute inset-0" />
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
