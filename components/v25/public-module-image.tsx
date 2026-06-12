"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

/** Local committed assets — serve via native <img> to avoid optimizer 500s on fallback. */
function isStaticAssetSrc(src: string) {
  return src.startsWith("/assets/") || src.startsWith("/images/");
}

function useNativeImg(src: string) {
  return isV25Src(src) || isStaticAssetSrc(src);
}

/** Cover image — v25 render + /assets via <img>, remote via next/image; onError → JPG logo. */
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
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setErrored(false);
  }, [src]);

  function handleError() {
    if (errored || currentSrc === fallbackSrc) return;
    setErrored(true);
    setCurrentSrc(fallbackSrc);
  }

  const coverClass =
    className ?? (fill ? "absolute inset-0 h-full w-full object-cover" : "h-full w-full object-cover");

  if (useNativeImg(currentSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        className={coverClass}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
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
