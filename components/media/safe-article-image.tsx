"use client";

import { useState } from "react";

type Props = {
  src?: string | null;
  fallbackSrc?: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
};

/** Direct <img> with optional fallback — avoids /_next/image 404s on Workers. */
export function SafeArticleImage({
  src,
  fallbackSrc,
  alt = "",
  className = "",
}: Props) {
  const [step, setStep] = useState<"primary" | "fallback" | "empty">(
    src ? "primary" : fallbackSrc ? "fallback" : "empty"
  );
  const current = step === "primary" ? src : step === "fallback" ? fallbackSrc : null;

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
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (step === "primary" && fallbackSrc) setStep("fallback");
        else setStep("empty");
      }}
    />
  );
}
