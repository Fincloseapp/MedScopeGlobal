"use client";

import type { AppProduct } from "@/lib/apps/catalog";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";

type Props = {
  app: AppProduct;
  /** Compact ribbon (shorter crop) */
  compact?: boolean;
  className?: string;
};

/**
 * Same marketing artwork as medscopeglobal.com app cards
 * (`APP_MARKETING_IMAGE` / `/assets/marketing/*`).
 */
export function AppBrandVisual({ app, compact = false, className = "" }: Props) {
  /** Version query already applied in APP_MARKETING_IMAGE */
  const src = APP_MARKETING_IMAGE[app.id];
  return (
    <figure className={`overflow-hidden bg-slate-200 ${className}`}>
      <div
        className={
          compact
            ? "relative aspect-[21/9] max-h-36 w-full overflow-hidden sm:max-h-44"
            : "relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]"
        }
      >
        {/* Plain img avoids next/image SSR/hydration quirks inside client shells */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${app.shortName} — ${app.tagline}`}
          className="h-full w-full object-cover object-center"
          decoding="async"
        />
      </div>
      <figcaption className="border-t border-black/5 bg-white/90 px-3 py-2 sm:px-4">
        <p className="font-display text-sm font-semibold text-[#021d33] sm:text-base">{app.shortName}</p>
        <p className="text-xs text-slate-600 sm:text-sm">{app.tagline}</p>
      </figcaption>
    </figure>
  );
}
