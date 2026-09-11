import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppOpenLink, isStandaloneAppHref } from "@/components/apps/app-origin-bar";
import { MAGAZINE } from "@/lib/brand/magazine";
import { editionCoverAlt, isoWeekSeed, pickEditionCover } from "@/lib/brand/edition-covers";
import { APP_MARKETING_IMAGE, MARKETPLACE_VISUALS } from "@/lib/brand/marketing-visuals";
import {
  getHomepagePillarsCopy,
  type HomepagePillar,
  type HomepagePillarId,
} from "@/lib/i18n/homepage-pillars-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { cn } from "@/lib/utils";

const TONE: Record<HomepagePillarId, string> = {
  magazine: "border-[#cfe1f3] bg-white",
  marketplace: "border-[#021d33] bg-[#021d33] text-white",
  students: "border-[#c9e4d4] bg-white",
  physicians: "border-[#c5d4ea] bg-white",
};

function PillarVisual({ pillar, locale }: { pillar: HomepagePillar; locale: string }) {
  if (pillar.id === "magazine") {
    const cover = pickEditionCover(locale, `${isoWeekSeed()}:pillar`);
    return (
      <span className="relative block aspect-[16/10] w-full overflow-hidden bg-[#050b1d]">
        <Image
          src={cover.src}
          alt={editionCoverAlt(locale)}
          fill
          className="object-cover object-top"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 280px"
        />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050b1d] via-[#050b1d]/55 to-transparent px-3 pb-3 pt-10">
          <Image
            src={MAGAZINE.emailLockup}
            alt=""
            width={240}
            height={68}
            className="h-7 w-auto object-contain object-left"
          />
        </span>
      </span>
    );
  }

  if (pillar.id === "marketplace") {
    return (
      <span className="relative block aspect-[16/10] w-full overflow-hidden bg-[#021d33]">
        <Image
          src={MARKETPLACE_VISUALS.workstation}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 280px"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#021d33] via-[#021d33]/25 to-transparent" />
      </span>
    );
  }

  const src = pillar.id === "students" ? APP_MARKETING_IMAGE.mediprep : APP_MARKETING_IMAGE.ordizapis;
  return (
    <span
      className={cn(
        "relative block aspect-[16/10] w-full overflow-hidden",
        pillar.id === "students" ? "bg-[#eef8f2]" : "bg-[#eef3fb]"
      )}
    >
      <Image src={src} alt="" fill className="object-contain object-center p-3" sizes="280px" />
    </span>
  );
}

function PillarCta({
  href,
  locale,
  className,
  children,
}: {
  href: string;
  locale: string;
  className: string;
  children: ReactNode;
}) {
  if (isStandaloneAppHref(href)) {
    return (
      <AppOpenLink href={href} className={className}>
        {children}
      </AppOpenLink>
    );
  }
  return (
    <Link href={localizePublicHref(href, locale)} className={className}>
      {children}
    </Link>
  );
}

export function HomepagePillars({ locale = "cs" }: { locale?: string }) {
  const copy = getHomepagePillarsCopy(locale);
  const cols =
    copy.pillars.length === 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : "sm:grid-cols-3";

  return (
    <section
      id="pro-koho"
      data-studio="homepage-pillars"
      aria-labelledby="homepage-pillars-title"
      className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">{copy.kicker}</p>
      <h2 id="homepage-pillars-title" className="mt-1 font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
        {copy.title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{copy.lead}</p>

      <nav aria-label={copy.jumpLabel} className="mt-4 flex flex-wrap gap-1.5">
        {copy.pillars.map((pillar) => (
          <a
            key={`jump-${pillar.id}`}
            href={`#pillar-${pillar.id}`}
            className="rounded-full border border-slate-200 bg-[#f7fafc] px-3 py-1 text-[11px] font-semibold text-[#021d33] hover:border-[#005B96]/40 hover:bg-[#e8f3fb]"
          >
            {pillar.title}
          </a>
        ))}
      </nav>

      <ul className={cn("mt-5 grid gap-3", cols)}>
        {copy.pillars.map((pillar) => {
          const market = pillar.id === "marketplace";
          return (
            <li key={pillar.id} id={`pillar-${pillar.id}`}>
              <article className={cn("flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm", TONE[pillar.id])}>
                <PillarVisual pillar={pillar} locale={locale} />
                <div className="flex flex-1 flex-col p-5">
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.22em]",
                      market ? "text-[#e8d5a3]" : "text-[#005B96]"
                    )}
                  >
                    {pillar.eyebrow}
                  </p>
                  <h3 className={cn("mt-1 font-display text-xl font-bold", market ? "text-white" : "text-[#021d33]")}>
                    {pillar.title}
                  </h3>
                  <p className={cn("mt-2 flex-1 text-sm leading-relaxed", market ? "text-white/80" : "text-slate-600")}>
                    {pillar.lead}
                  </p>
                  <p className={cn("mt-3 text-xs font-medium", market ? "text-[#e8d5a3]" : "text-slate-500")}>
                    {pillar.product}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <PillarCta
                      href={pillar.ctaHref}
                      locale={locale}
                      className={cn(
                        "inline-flex rounded-full px-4 py-2 text-sm font-semibold",
                        market
                          ? "bg-[#c4a35a] text-[#021d33] hover:bg-[#e8d5a3]"
                          : "bg-[#005B96] text-white hover:bg-[#004a7a]"
                      )}
                    >
                      {pillar.cta}
                    </PillarCta>
                    <PillarCta
                      href={pillar.secondaryHref}
                      locale={locale}
                      className={cn(
                        "text-sm font-medium underline-offset-2 hover:underline",
                        market ? "text-white/80" : "text-[#005B96]"
                      )}
                    >
                      {pillar.secondary}
                    </PillarCta>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
