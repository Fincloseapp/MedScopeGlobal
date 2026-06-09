import Link from "next/link";
import {
  MEDSCOPE_LOGO_ALT,
  resolveLogoSources,
  type MedScopeLogoVariant,
} from "@/lib/brand/logo";
import { LOGO_PRESETS, type LogoPreset } from "@/lib/brand/logo-presets";
import { cn } from "@/lib/utils";

type Props = {
  preset?: LogoPreset;
  variant?: "auto" | MedScopeLogoVariant | "print";
  href?: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

function LogoPicture({
  variant,
  width,
  height,
  imgClass,
  priority,
}: {
  variant: MedScopeLogoVariant;
  width: number;
  height: number;
  imgClass: string;
  priority: boolean;
}) {
  const { src, srcSet, webpSrcSet } = resolveLogoSources(variant);

  return (
    <picture>
      <source srcSet={webpSrcSet} type="image/webp" />
      <img
        src={src}
        srcSet={srcSet}
        alt={MEDSCOPE_LOGO_ALT}
        width={width}
        height={height}
        className={imgClass}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}

export function MedScopeLogo({
  preset,
  variant: variantProp,
  href = "/",
  className,
  imageClassName,
  width: widthProp,
  height: heightProp,
  priority = false,
}: Props) {
  const cfg = preset ? LOGO_PRESETS[preset] : null;
  const variant = variantProp ?? cfg?.variant ?? "auto";
  const width = widthProp ?? cfg?.width ?? 160;
  const height = heightProp ?? cfg?.height ?? 40;
  const imgClass = cn("object-contain", cfg?.imageClassName, imageClassName);
  const wrapClass = cn(cfg?.className, className);

  const inner =
    variant === "auto" ? (
      <>
        <span className="dark:hidden">
          <LogoPicture variant="transparent" width={width} height={height} imgClass={imgClass} priority={priority} />
        </span>
        <span className="hidden dark:inline">
          <LogoPicture variant="negative" width={width} height={height} imgClass={imgClass} priority={priority} />
        </span>
      </>
    ) : (
      <LogoPicture
        variant={variant === "print" ? "print" : variant}
        width={width}
        height={height}
        imgClass={imgClass}
        priority={priority}
      />
    );

  if (!href) {
    return <span className={cn("inline-flex shrink-0 items-center", wrapClass)}>{inner}</span>;
  }

  return (
    <Link href={href} prefetch className={cn("inline-flex shrink-0 items-center", wrapClass)}>
      {inner}
    </Link>
  );
}
