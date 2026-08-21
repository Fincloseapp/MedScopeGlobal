"use client";

import { useEffect, useState } from "react";

type Props = {
  src?: string | null;
  fallbackSrc?: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Direct <img> for article covers. Cloudflare Workers /_next/image 404s remote covers.
 * On error, swap to fallbackSrc, then a brand gradient.
 */
export function SafeArticleImage({
  src,
  fallbackSrc,
  alt = "",
  className = "",
  sizes: _sizes,
  priority = false,
}: Props) {
  const initial = src?.trim() || fallbackSrc?.trim() || "";
  const [currentSrc, setCurrentSrc] = useState(initial);
  const [failed, setFailed] = useState(!initial);

  useEffect(() => {
    const next = src?.trim() || fallbackSrc?.trim() || "";
    setCurrentSrc(next);
    setFailed(!next);
  }, [src, fallbackSrc]);

  function handleError() {
    const fallback = fallbackSrc?.trim();
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      return;
    }
    setFailed(true);
  }

  if (failed || !currentSrc) {
    return (
      <span
        className={`absolute inset-0 block h-full w-full bg-gradient-to-br from-[#021d33] via-[#0a4a73] to-[#005B96] ${className}`}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={`absolute inset-0 h-full w-full object-cover object-center ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
}
