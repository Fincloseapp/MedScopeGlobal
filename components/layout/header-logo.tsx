import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { MAGAZINE } from "@/lib/brand/magazine";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";
import { cn } from "@/lib/utils";

export const HEADER_TAGLINE = `${MAGAZINE.name} · MediFlow · MeDipacient · OrdiZapis`;

export const HEADER_LOGO_HEIGHT = { mobile: 56, tablet: 56, desktop: 70 } as const;

type Props = {
  centered?: boolean;
  className?: string;
  priority?: boolean;
  locale?: string;
};

/** v23.3.1 — mobile 56px max visibility + desktop 70px */
export function HeaderLogo({
  centered = false,
  className,
  priority = true,
  locale = "cs",
}: Props) {
  const home = getSurfaceCopy(locale).footer.home;
  return (
    <Link
      href={localizePublicHref("/", locale)}
      prefetch
      className={cn(
        "logo-block group flex shrink-0 flex-col transition-opacity hover:opacity-[0.97]",
        centered ? "items-center pr-0 text-center" : "items-start pr-2 text-left lg:pr-3",
        className
      )}
      aria-label={`MedScopeGlobal — ${home}`}
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
            "h-14 min-w-[148px] max-w-[200px]",
            "md:h-14 md:min-w-[150px] md:max-w-[210px]",
            "lg:h-[64px] lg:min-w-[168px] lg:max-w-[240px]"
          )}
        />
      </span>
      <p
        className={cn(
          "tagline font-medium leading-tight",
          "text-[11px] tracking-[0.18em]",
          "lg:mt-0.5 lg:text-xs",
          centered ? "text-center" : "text-left",
          "text-[#021d33] dark:text-[#E8EEF4]"
        )}
      >
        {MAGAZINE.name}
      </p>
    </Link>
  );
}

export { HeaderLogo as HeaderLogoBlock };
