import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { cn } from "@/lib/utils";

export const HEADER_TAGLINE = "Medical Intelligence Network";

/** v23.2.8 — logo : nav text ratio target (~2.2× cap-height feel at 64px / 15.5px) */
export const HEADER_LOGO_HEIGHT = { mobile: 48, tablet: 56, desktop: 64 } as const;

type Props = {
  centered?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Premium logo block — 48 / 56 / 64 px, WebP + retina (v23.2.8)
 */
export function HeaderLogo({ centered = false, className, priority = true }: Props) {
  return (
    <Link
      href="/"
      prefetch
      className={cn(
        "logo-block group flex shrink-0 flex-col gap-1.5 pr-4 transition-opacity hover:opacity-[0.97]",
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
            "h-12 min-w-[148px] max-w-[200px]",
            "md:h-14 md:min-w-[168px] md:max-w-[228px]",
            "lg:h-16 lg:min-w-[186px] lg:max-w-[272px]"
          )}
        />
      </span>
      <p
        className={cn(
          "tagline mt-0.5 font-extralight leading-snug",
          "text-[11px] tracking-[0.35px] opacity-75 sm:text-xs",
          "md:text-[11px] lg:text-[13px] xl:text-sm",
          "text-[#6A6A6A] dark:text-[#A0A0A0] dark:opacity-85"
        )}
      >
        {HEADER_TAGLINE}
      </p>
    </Link>
  );
}

export { HeaderLogo as HeaderLogoBlock };
