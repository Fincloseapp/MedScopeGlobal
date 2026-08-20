"use client";

import { useState } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
};

/** Direct <img> — Cloudflare Workers /_next/image returns 404 for remote covers. */
export function CoverImage({ src, alt = "", className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
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
      src={src}
      alt={alt}
      className={`h-full w-full object-cover object-center ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
