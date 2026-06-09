import Image from "next/image";
import Link from "next/link";
import { MEDSCOPE_LOGO, MEDSCOPE_LOGO_ALT } from "@/lib/brand/logo";
import { LOGO_PRESETS, type LogoPreset } from "@/lib/brand/logo-presets";
import { cn } from "@/lib/utils";

type Props = {
  preset?: LogoPreset;
  variant?: "auto" | "transparent" | "negative" | "print";
  href?: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

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
  const imgClass = cn(cfg?.imageClassName, imageClassName);
  const wrapClass = cn(cfg?.className, className);

  const inner =
    variant === "auto" ? (
      <>
        <Image
          src={MEDSCOPE_LOGO.transparent}
          alt={MEDSCOPE_LOGO_ALT}
          width={width}
          height={height}
          className={cn("object-contain dark:hidden", imgClass || "h-auto w-auto max-h-10")}
          priority={priority}
        />
        <Image
          src={MEDSCOPE_LOGO.negative}
          alt={MEDSCOPE_LOGO_ALT}
          width={width}
          height={height}
          className={cn("hidden object-contain dark:block", imgClass || "h-auto w-auto max-h-10")}
          priority={priority}
        />
      </>
    ) : (
      <Image
        src={MEDSCOPE_LOGO[variant === "print" ? "print" : variant]}
        alt={MEDSCOPE_LOGO_ALT}
        width={width}
        height={height}
        className={cn("object-contain", imgClass || "h-auto w-auto max-h-10")}
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
