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
 * NEJM-level logo block — dominant logo + tagline
 * WebP + retina via MedScopeLogo / resolveLogoSources
 */
export function HeaderLogo({ centered = false, className, priority = true }: Props) {
  return (
    <Link
      href="/"
      prefetch
      className={cn(
        "logo-block flex shrink-0 flex-col gap-0.5 pr-4 transition-opacity hover:opacity-95",
        centered ? "items-center text-center" : "items-start text-left",
        className
      )}
      aria-label="MedScopeGlobal — domů"
    >
      <MedScopeLogo
        href=""
        preset="header"
        priority={priority}
        className="p-0"
        imageClassName="h-11 w-auto min-w-[140px] max-w-[180px] object-contain sm:h-14 sm:max-w-[220px]"
      />
      <p
        className={cn(
          "tagline -mt-0.5 font-light leading-tight tracking-[0.3px]",
          "text-[11px] opacity-85 sm:text-xs md:text-[11px] lg:text-[13px] xl:text-sm",
          "text-slate-600 dark:text-[#A0A0A0]"
        )}
      >
        {HEADER_TAGLINE}
      </p>
    </Link>
  );
}

/** Alias per v23.2.6 spec */
export { HeaderLogo as HeaderLogoBlock };
