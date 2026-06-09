import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { cn } from "@/lib/utils";

export const HEADER_TAGLINE = "Medical Intelligence Network";

export const HEADER_LOGO_HEIGHT = { mobile: 48, tablet: 56, desktop: 70 } as const;

type Props = {
  centered?: boolean;
  className?: string;
  priority?: boolean;
};

/** v23.3.0 — stabilized logo block, 48 / 56 / 70 px */
export function HeaderLogo({ centered = false, className, priority = true }: Props) {
  return (
    <Link
      href="/"
      prefetch
      className={cn(
        "logo-block group flex shrink-0 flex-col pr-2 transition-opacity hover:opacity-[0.97] lg:pr-3",
        centered ? "items-center text-center" : "items-start text-left",
        className
      )}
      aria-label="MedScopeGlobal — domů"
    >
      <span className="logo-mark inline-block origin-left translate-y-[2px] max-md:origin-center md:origin-left">
        <MedScopeLogo
          href=""
          preset="header"
          priority={priority}
          className="p-0"
          imageClassName={cn(
            "w-auto object-contain [letter-spacing:0.12px]",
            "h-12 min-w-[152px] max-w-[212px]",
            "md:h-14 md:min-w-[170px] md:max-w-[232px]",
            "lg:h-[70px] lg:min-w-[196px] lg:max-w-[300px]"
          )}
        />
      </span>
      <p
        className={cn(
          "tagline mt-1 font-extralight leading-tight",
          "text-[11px] tracking-[0.35px] opacity-75 sm:text-xs",
          "lg:text-[13px]",
          "text-[#6A6A6A] dark:text-[#A0A0A0] dark:opacity-85"
        )}
      >
        {HEADER_TAGLINE}
      </p>
    </Link>
  );
}

export { HeaderLogo as HeaderLogoBlock };
