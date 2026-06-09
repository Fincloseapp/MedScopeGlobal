import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { cn } from "@/lib/utils";

export const HEADER_TAGLINE = "Medical Intelligence Network";

type Props = {
  /** Center logo + tagline (mobile layout) */
  centered?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * NEJM-plus logo block — optical dominance, WebP + retina (v23.2.7)
 */
export function HeaderLogo({ centered = false, className, priority = true }: Props) {
  return (
    <Link
      href="/"
      prefetch
      className={cn(
        "logo-block group flex shrink-0 flex-col pr-4 transition-opacity hover:opacity-[0.97]",
        centered ? "items-center text-center" : "items-start text-left",
        className
      )}
      aria-label="MedScopeGlobal — domů"
    >
      <span className="logo-mark inline-block origin-left translate-y-[1.5px] scale-[1.1] max-md:origin-center md:origin-left">
        <MedScopeLogo
          href=""
          preset="header"
          priority={priority}
          className="p-0"
          imageClassName="h-12 w-auto min-w-[154px] max-w-[198px] object-contain [letter-spacing:0.12px] sm:h-[3.85rem] sm:max-w-[242px] md:max-w-[248px]"
        />
      </span>
      <p
        className={cn(
          "tagline mt-1 font-extralight leading-snug",
          "text-[11px] tracking-[0.35px] opacity-75",
          "sm:text-xs md:text-[11px] lg:text-[13px] xl:text-[14px]",
          "text-[#6A6A6A] dark:text-[#A0A0A0] dark:opacity-85"
        )}
      >
        {HEADER_TAGLINE}
      </p>
    </Link>
  );
}

/** Alias per spec */
export { HeaderLogo as HeaderLogoBlock };
