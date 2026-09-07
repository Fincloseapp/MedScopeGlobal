"use client";

import { SocialShareStrip } from "@/components/social/social-share-strip";
import { getShareCopy } from "@/lib/i18n/share-copy";
import type { PromoTeaser } from "@/lib/ads/promo-teasers";

export function PromoTeaserCard({
  teaser,
  locale = "cs",
  autoPlay = false,
}: {
  teaser: PromoTeaser;
  locale?: string;
  autoPlay?: boolean;
}) {
  const copy = getShareCopy(locale);
  return (
    <article className="overflow-hidden rounded-2xl border border-[#d7e6f4] bg-[#021d33]">
      <div className="relative mx-auto aspect-[9/16] max-h-[560px] w-full bg-black">
        <video
          className="h-full w-full object-cover"
          poster={teaser.posterSrc}
          src={teaser.videoSrc}
          controls
          playsInline
          muted
          loop
          preload="metadata"
          autoPlay={autoPlay}
          aria-label={`${teaser.brand} ${teaser.line}`}
        />
      </div>
      <div className="space-y-3 bg-white px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005B96]">{teaser.brand}</p>
        <h3 className="font-display text-lg font-semibold text-[#021d33]">{teaser.line}</h3>
        <p className="text-sm text-slate-600">{teaser.sub}</p>
        <p className="text-xs font-medium text-[#005B96]">{teaser.site}</p>
        <SocialShareStrip title={teaser.shareTitle} path="/promo/klipy" locale={locale} />
        <a
          href={teaser.videoSrc}
          download
          className="inline-flex text-sm font-semibold text-[#005B96] hover:underline"
        >
          {copy.downloadClip}
        </a>
      </div>
    </article>
  );
}
