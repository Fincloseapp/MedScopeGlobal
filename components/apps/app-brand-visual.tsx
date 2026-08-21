"use client";

import Image from "next/image";
import type { AppProduct } from "@/lib/apps/catalog";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";

type Props = {
  app: AppProduct;
  /** Eager load when above the fold on the landing tab */
  priority?: boolean;
  /** Compact ribbon under chrome (shorter crop) */
  compact?: boolean;
  className?: string;
};

/**
 * Same marketing artwork as medscopeglobal.com app cards
 * (`APP_MARKETING_IMAGE` / `/assets/marketing/*`).
 */
export function AppBrandVisual({ app, priority = false, compact = false, className = "" }: Props) {
  const src = APP_MARKETING_IMAGE[app.id];
  return (
    <figure className={`overflow-hidden bg-slate-200 ${className}`}>
      <div
        className={
          compact
            ? "relative aspect-[21/9] max-h-36 w-full sm:max-h-44"
            : "relative aspect-[16/9] w-full sm:aspect-[21/9]"
        }
      >
        <Image
          src={src}
          alt={`${app.shortName} — ${app.tagline}`}
          fill
          priority={priority}
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 48rem"
        />
      </div>
      <figcaption className="border-t border-black/5 bg-white/90 px-3 py-2 sm:px-4">
        <p className="font-display text-sm font-semibold text-[#021d33] sm:text-base">{app.shortName}</p>
        <p className="text-xs text-slate-600 sm:text-sm">{app.tagline}</p>
      </figcaption>
    </figure>
  );
}
