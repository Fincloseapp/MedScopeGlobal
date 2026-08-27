"use client";

import { useState } from "react";
import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
  /** When set, rewrite stale Unsplash / v25 stock via the shared resolver. */
  title?: string;
  slug?: string;
  excerpt?: string | null;
  category?: string | null;
  publicTopic?: string | null;
};

/** Direct <img> — Cloudflare Workers /_next/image returns 404 for remote covers. */
export function CoverImage({
  src,
  alt = "",
  className = "",
  title,
  slug,
  excerpt,
  category,
  publicTopic,
}: Props) {
  const [failed, setFailed] = useState(false);
  const resolved =
    title != null
      ? resolveArticleCoverUrl({
          title,
          slug,
          excerpt,
          category,
          publicTopic,
          coverImageUrl: src,
          preferCurated: true,
        })
      : src;
  if (!resolved || failed) {
    return (
      <span
        className={`block h-full w-full bg-gradient-to-br from-[#021d33] via-[#0a4a73] to-[#005B96] ${className}`}
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={`h-full w-full object-cover object-center ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
