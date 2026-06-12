"use client";

import Image from "next/image";
import { useState } from "react";
import { isV25ImageUrl } from "@/lib/v25/images/legacy-images";
import { STUDY_GAME_IMAGE_FALLBACK } from "@/lib/v22/game-images";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  fallbackSrc?: string;
};

function isV25Src(src: string) {
  return isV25ImageUrl(src) || src.includes("/api/v25/images/");
}

/** Cover image — v25 SVG/render API přes <img>, ostatní přes next/image; onError → static fallback. */
export function PublicModuleImage({
  src,
  alt,
  className,
  sizes,
  priority,
  fill = true,
  fallbackSrc = STUDY_GAME_IMAGE_FALLBACK,
}: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);

  function handleError() {
    if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
  }

  if (isV25Src(currentSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        className={
          className ?? (fill ? "absolute inset-0 h-full w-full object-cover" : "h-full w-full object-cover")
        }
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        fill
        onError={handleError}
        className={className ?? "object-cover"}
        sizes={sizes ?? "(max-width: 896px) 100vw, 896px"}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={800}
      height={450}
      onError={handleError}
      className={className ?? "object-cover"}
      sizes={sizes}
      priority={priority}
    />
  );
}
