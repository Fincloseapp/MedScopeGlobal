import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MAGAZINE } from "@/lib/brand/magazine";

export const NEWSLETTER_HERO_TAGLINE = MAGAZINE.name;

type Props = {
  title: string;
  subhead?: string;
  href?: string;
  tagline?: string;
  className?: string;
  priority?: boolean;
};

/** ViaLongeVita magazine brief hero */
export function NewsletterHero({ title, subhead, href = "/", tagline, className, priority = true }: Props) {
  const lockup = (
    <Image
      src={MAGAZINE.emailLockup}
      alt={MAGAZINE.name}
      width={1200}
      height={340}
      priority={priority}
      className="h-auto w-full max-w-[520px] object-contain"
    />
  );

  return (
    <header
      className={cn(
        "newsletter-hero flex flex-col items-center px-6 py-12 text-center sm:px-8 sm:py-14 md:py-16",
        className
      )}
    >
      <div className="newsletter-hero-logo mb-6 flex justify-center sm:mb-7">
        {href ? (
          <Link href={href} className="inline-block">
            {lockup}
          </Link>
        ) : (
          lockup
        )}
      </div>

      <p className="mb-5 text-[15px] font-light tracking-[0.35px] opacity-80 sm:mb-6">
        {tagline ?? NEWSLETTER_HERO_TAGLINE}
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
  href = "/",
  priority = true,
}: {
  className?: string;
  href?: string;
  priority?: boolean;
}) {
  const lockup = (
    <Image
      src={MAGAZINE.emailLockup}
      alt={MAGAZINE.name}
      width={1200}
      height={340}
      priority={priority}
      className="h-auto w-full max-w-[360px] object-contain"
    />
  );
  return (
    <div className={cn("newsletter-hero-logo mb-6 flex justify-center sm:mb-7", className)}>
      {href ? (
        <Link href={href} className="inline-block">
          {lockup}
        </Link>
      ) : (
        lockup
      )}
    </div>
  );
}
