import Image from "next/image";
import Link from "next/link";
import { MEDSCOPE_LOGO, MEDSCOPE_LOGO_ALT } from "@/lib/brand/logo";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "auto" | "transparent" | "negative" | "print";
  href?: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function MedScopeLogo({
  variant = "auto",
  href = "/",
  className,
  imageClassName,
  width = 160,
  height = 40,
  priority = false,
}: Props) {
  const inner =
    variant === "auto" ? (
      <>
        <Image
          src={MEDSCOPE_LOGO.transparent}
          alt={MEDSCOPE_LOGO_ALT}
          width={width}
          height={height}
          className={cn("h-auto w-auto max-h-10 object-contain dark:hidden", imageClassName)}
          priority={priority}
        />
        <Image
          src={MEDSCOPE_LOGO.negative}
          alt={MEDSCOPE_LOGO_ALT}
          width={width}
          height={height}
          className={cn("hidden h-auto w-auto max-h-10 object-contain dark:block", imageClassName)}
          priority={priority}
        />
      </>
    ) : (
      <Image
        src={MEDSCOPE_LOGO[variant === "print" ? "print" : variant]}
        alt={MEDSCOPE_LOGO_ALT}
        width={width}
        height={height}
        className={cn("h-auto w-auto max-h-10 object-contain", imageClassName)}
        priority={priority}
      />
    );

  if (!href) {
    return <span className={cn("inline-flex shrink-0 items-center", className)}>{inner}</span>;
  }

  return (
    <Link href={href} prefetch className={cn("inline-flex shrink-0 items-center", className)}>
      {inner}
    </Link>
  );
}
