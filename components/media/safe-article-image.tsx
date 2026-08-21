"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FALLBACK_DISPLAY_COVER } from "@/lib/v271/topic-covers";

type Props = {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

/** next/image with a visible fallback when the remote cover 404s. */
export function SafeArticleImage({
  src,
  fallbackSrc = FALLBACK_DISPLAY_COVER,
  alt = "",
  fill = true,
  priority = false,
  className = "object-cover",
  sizes,
}: Props) {
  const [step, setStep] = useState<"src" | "fallback" | "hidden">("src");
  useEffect(() => {
    setStep("src");
  }, [fallbackSrc, src]);

  const url = step === "fallback" ? fallbackSrc : src;

  if (step === "hidden") {
    return <div className="absolute inset-0 bg-gradient-to-br from-[#021d33] via-[#0A3D5C] to-[#005B96]" />;
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill={fill}
      priority={priority}
      className={className}
      sizes={sizes}
      onError={() => setStep((prev) => (prev === "src" ? "fallback" : "hidden"))}
    />
  );
}
