import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import type { MagazineSectionHubConfig } from "@/lib/portal/magazine-section-hub";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";

type Props = {
  config: MagazineSectionHubConfig;
  children: React.ReactNode;
  /** Override primary CTA href when today's lesson slug is known. */
  primaryCtaHref?: string;
};

/**
 * Reusable premium magazine hub shell — hero, editorial intro, topic pillars, content slot.
 * Section pages (osvěta today) compose dynamic blocks as `children`.
 */
export function MagazineSectionHub({ config, children, primaryCtaHref }: Props) {
  const primaryHref = primaryCtaHref ?? config.primaryCta.href;

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021d33] via-[#003d6b] to-[#005B96]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
              {config.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {config.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{config.heroDeck}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#005B96] shadow-sm transition hover:bg-white/90"
              >
                <Headphones className="h-4 w-4" aria-hidden />
                {config.primaryCta.label}
              </Link>
              {config.secondaryCtas.map((cta) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_28px_70px_rgba(0,0,0,0.35)] ring-1 ring-white/20">
              <Image
                src={config.heroCoverImage}
                alt={config.heroCoverAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 420px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-[#021d33]/75 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9fd0f5]">
                  Poslech + čtení
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/90">
                  Každá lekce má text k souběžnému čtení — stejný tón jako dlouhé články magazínu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PublicTrustDisclaimer className="mb-10" />

        <section className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
            Redakční úvod
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#021d33]">
            Co je osvěta na MedScopeGlobal
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-base leading-relaxed text-slate-600">
            {config.editorialIntro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {config.pillarsEyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#021d33]">
            {config.pillarsTitle}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {config.pillars.map((pillar) => (
              <Link
                key={pillar.slug}
                href={pillar.href}
                prefetch
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#005B96]/35 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image
                    src={pillar.coverImage}
                    alt=""
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="25vw"
                  />
                </div>
                <div className="p-4">
                  <p className="font-display font-semibold text-[#021d33] group-hover:text-[#005B96]">
                    {pillar.label}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{pillar.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {children}

        <section className="mt-14 rounded-2xl border border-[#cfe1f3] bg-gradient-to-br from-white to-[#f0f7fc] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
                Podpora redakce
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-[#021d33]">
                {config.contribution.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {config.contribution.description}
              </p>
            </div>
            <Link
              href={config.contribution.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004a78]"
            >
              {config.contribution.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <p className="mt-10 text-center">
          <PublicTrustDisclaimer variant="inline" />
        </p>
      </div>
    </div>
  );
}

/** Section header used inside hub content blocks. */
export function MagazineHubSectionHeader({
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
  id?: string;
}) {
  return (
    <div id={id} className="mb-4 flex flex-wrap items-end justify-between gap-3 scroll-mt-24">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p>
        <h2 className="font-display text-2xl font-bold text-[#021d33]">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>
      {href && ctaLabel ? (
        <Link href={href} className="shrink-0 text-sm font-medium text-[#005B96] hover:underline">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
