import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { cn } from "@/lib/utils";

export const HEADER_TAGLINE = "Medical Intelligence Network";

export const HEADER_LOGO_HEIGHT = { mobile: 56, tablet: 56, desktop: 70 } as const;

type Props = {
  centered?: boolean;
  className?: string;
  priority?: boolean;
};

/** v23.3.1 — mobile 56px max visibility + desktop 70px */
export function HeaderLogo({ centered = false, className, priority = true }: Props) {
  return (
    <Link
      href="/"
      prefetch
      className={cn(
        "logo-block group flex shrink-0 flex-col transition-opacity hover:opacity-[0.97]",
        centered ? "items-center pr-0 text-center" : "items-start pr-2 text-left lg:pr-3",
        className
      )}
      aria-label="MedScopeGlobal — domů"
    >
      <span
        className={cn(
          "logo-mark mb-1 inline-block translate-y-px md:mb-0.5 md:origin-left md:translate-y-[2px] lg:origin-left",
          centered
            ? "origin-center max-md:scale-[1.13]"
            : "max-md:origin-left max-md:scale-[1.13]"
        )}
      >
        <MedScopeLogo
          href=""
          preset="header"
          priority={priority}
          className="p-0"
          imageClassName={cn(
            "w-auto object-contain [letter-spacing:0.12px]",
            "h-14 min-w-[168px] max-w-[240px]",
            "md:h-14 md:min-w-[170px] md:max-w-[232px]",
            "lg:h-[70px] lg:min-w-[196px] lg:max-w-[300px]"
          )}
        />
      </span>
      <p
        className={cn(
          "tagline font-extralight leading-tight",
          "text-xs tracking-[0.35px] opacity-80",
          "lg:mt-1 lg:text-[13px] lg:opacity-75",
          centered ? "text-center" : "text-left",
          "text-[#6A6A6A] dark:text-[#A0A0A0] dark:opacity-85"
        )}
      >
        {HEADER_TAGLINE}
      </p>
    </Link>
  );
}

export { HeaderLogo as HeaderLogoBlock };
