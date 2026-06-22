import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { cn } from "@/lib/utils";

export const NEWSLETTER_HERO_TAGLINE = "Medical Intelligence Network";

type Props = {
  title: string;
  subhead?: string;
  href?: string;
  className?: string;
  priority?: boolean;
};

/** v23.3.2 — BMJ / Lancet / NEJM premium newsletter hero */
export function NewsletterHero({ title, subhead, href = "", className, priority = true }: Props) {
  return (
    <header
      className={cn(
        "newsletter-hero flex flex-col items-center px-6 py-12 text-center sm:px-8 sm:py-14 md:py-16",
        className
      )}
    >
      <div className="newsletter-hero-logo mb-6 flex justify-center sm:mb-7">
        <MedScopeLogo href={href} preset="newsletter-hero" priority={priority} />
      </div>

      <p className="mb-5 text-[15px] font-light tracking-[0.35px] opacity-80 sm:mb-6">
        {NEWSLETTER_HERO_TAGLINE}
      </p>

      <h1 className="mx-auto mb-6 max-w-[720px] text-[26px] font-semibold leading-[1.25] sm:mb-8 sm:text-[30px]">
        {title}
      </h1>

      {subhead ? (
        <p className="mx-auto mb-8 max-w-[760px] text-[17px] font-light leading-[1.45] opacity-85 sm:mb-10 sm:text-lg sm:font-normal">
          {subhead}
        </p>
      ) : null}
    </header>
  );
}

/** Logo-only block (legacy / compact embeds) */
export function NewsletterHeroLogo({
  className,
  href = "",
  priority = true,
}: {
  className?: string;
  href?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("newsletter-hero-logo mb-6 flex justify-center sm:mb-7", className)}>
      <MedScopeLogo href={href} preset="newsletter-hero" priority={priority} />
    </div>
  );
}
