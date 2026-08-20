import Link from "next/link";
import { cn } from "@/lib/utils";

export const HEADER_TAGLINE = "medscopeglobal.com";

export const HEADER_LOGO_HEIGHT = { mobile: 56, tablet: 60, desktop: 64 } as const;

type Props = {
  centered?: boolean;
  className?: string;
  priority?: boolean;
};

/** Emblem + readable MedScopeGlobal.com lockup for the main bar. */
export function HeaderLogo({ centered = false, className, priority = true }: Props) {
  return (
    <Link
      href="/"
      prefetch
      className={cn(
        "logo-block group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-[0.97]",
        centered ? "justify-center pr-0" : "justify-start pr-2 lg:gap-3 lg:pr-3",
        className
      )}
      aria-label="MedScopeGlobal.com — domů"
    >
      <span className={cn("logo-mark inline-flex shrink-0", centered ? "origin-center" : "origin-left")}>
        <picture>
          <source srcSet="/assets/logo/logo-emblem.webp" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo/logo-emblem.png"
            alt=""
            width={160}
            height={76}
            className={cn(
              "w-auto object-contain object-left",
              centered ? "h-11" : "h-11 md:h-12 lg:h-[52px]"
            )}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </picture>
      </span>
      <span className={cn("min-w-0", centered ? "text-center" : "text-left")}>
        <span className="block font-display text-[15px] font-bold leading-tight tracking-tight text-[#005B96] sm:text-base lg:text-[1.15rem]">
          MedScopeGlobal.com
        </span>
        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px]">
          MeDipacient · MeDiprep · MeDiktor
        </span>
      </span>
    </Link>
  );
}

export { HeaderLogo as HeaderLogoBlock };
