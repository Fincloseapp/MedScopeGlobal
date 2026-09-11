import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, GraduationCap, Stethoscope, Store } from "lucide-react";
import { AppOpenLink, isStandaloneAppHref } from "@/components/apps/app-origin-bar";
import { ViaLongeVitaMark } from "@/components/brand/vialongevita-mark";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import {
  getHomepagePillarsCopy,
  type HomepagePillar,
  type HomepagePillarId,
} from "@/lib/i18n/homepage-pillars-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { cn } from "@/lib/utils";

const TONE: Record<HomepagePillarId, string> = {
  magazine: "border-[#cfe1f3] bg-gradient-to-b from-[#f4f9fd] to-white",
  marketplace: "border-[#021d33] bg-[#021d33] text-white",
  students: "border-[#c9e4d4] bg-gradient-to-b from-[#f3faf6] to-white",
  physicians: "border-[#c5d4ea] bg-gradient-to-b from-[#eef3fb] to-white",
};

function PillarGlyph({ id, marketplace }: { id: HomepagePillarId; marketplace?: boolean }) {
  const cls = marketplace ? "h-5 w-5 text-[#e8d5a3]" : "h-5 w-5 text-[#005B96]";
  switch (id) {
    case "magazine":
      return <BookOpen className={cls} aria-hidden />;
    case "marketplace":
      return <Store className={cls} aria-hidden />;
    case "students":
      return <GraduationCap className={cls} aria-hidden />;
    default:
      return <Stethoscope className={cls} aria-hidden />;
  }
}

function PillarVisual({ pillar }: { pillar: HomepagePillar }) {
  if (pillar.id === "magazine") {
    return (
      <div className="mb-3">
        <ViaLongeVitaMark variant="compact" />
      </div>
    );
  }
  if (pillar.id === "students" || pillar.id === "physicians") {
    const src = pillar.id === "students" ? APP_MARKETING_IMAGE.mediprep : APP_MARKETING_IMAGE.ordizapis;
    return (
      <span className="relative mb-3 block h-16 w-full overflow-hidden rounded-lg bg-slate-100">
        <Image src={src} alt="" fill className="object-cover object-top" sizes="280px" />
      </span>
    );
  }
  return (
    <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a2b44]">
      <PillarGlyph id={pillar.id} marketplace />
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
              <article className={cn("flex h-full flex-col rounded-2xl border p-5", TONE[pillar.id])}>
                <PillarVisual pillar={pillar} />
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
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
