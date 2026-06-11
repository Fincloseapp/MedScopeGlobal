import Image from "next/image";
import { isV25ImageUrl } from "@/lib/v25/images/legacy-images";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
};

function isV25Src(src: string) {
  return isV25ImageUrl(src) || src.includes("/api/v25/images/");
}

/** Cover image — v25 SVG/render API přes <img>, ostatní přes next/image. */
export function PublicModuleImage({ src, alt, className, sizes, priority, fill = true }: Props) {
  if (isV25Src(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className ?? (fill ? "absolute inset-0 h-full w-full object-cover" : "h-full w-full object-cover")}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className ?? "object-cover"}
        sizes={sizes ?? "(max-width: 896px) 100vw, 896px"}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={450}
      className={className ?? "object-cover"}
      sizes={sizes}
      priority={priority}
    />
  );
}
