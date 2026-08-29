"use client";

import { useState } from "react";
import { isBannedCoverUrl } from "@/lib/editorial/image-policy";

type Props = {
  src?: string | null;
  fallbackSrc?: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function safeSrc(url?: string | null): string | null {
  if (!url?.trim()) return null;
  if (isBannedCoverUrl(url)) return null;
  return url.trim();
}

/** Direct <img> with optional fallback — avoids /_next/image 404s on Workers. */
export function SafeArticleImage({
  src,
  fallbackSrc,
  alt = "",
  className = "",
  priority = false,
}: Props) {
  const primary = safeSrc(src);
  const fallback = safeSrc(fallbackSrc);
  const [step, setStep] = useState<"primary" | "fallback" | "empty">(
    primary ? "primary" : fallback ? "fallback" : "empty"
  );
  const current = step === "primary" ? primary : step === "fallback" ? fallback : null;

  if (!current) {
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
      src={current}
      alt={alt}
      className={`h-full w-full object-cover object-center ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (step === "primary" && fallback) setStep("fallback");
        else setStep("empty");
      }}
    />
  );
}
