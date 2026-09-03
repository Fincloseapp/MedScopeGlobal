import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { V27Audience } from "@/lib/v27/config";
import { V27_AUDIENCES } from "@/lib/v27/config";
import { getV27AudienceGridCopy, getV27AudienceHubCopy } from "@/lib/i18n/v27-audience-copy";
import { isCzechSurface } from "@/lib/i18n/surface-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

type Props = {
  audience: V27Audience;
  variant?: "card" | "hero";
};

export async function V27AudienceHub({ audience, variant = "card" }: Props) {
  const cfg = V27_AUDIENCES[audience];
  if (!cfg) return null;
  const locale = await getServerLocale();
  const copy = getV27AudienceHubCopy(audience, locale);

  if (variant === "hero") {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021d33] via-[#003d6b] to-[#005B96] px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            MedScopeGlobal · {copy.shortLabel}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {copy.label}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{copy.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-white text-[#005B96] hover:bg-sky-50">
              <Link href={localizePublicHref(copy.primaryHref, locale)}>{copy.primaryLabel}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href={localizePublicHref(copy.secondaryHref, locale)}>{copy.secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Link
      href={localizePublicHref(copy.hubHref, locale)}
      className="group block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#005B96]/40 hover:shadow-lg"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
        {copy.shortLabel}
      </p>
      <h3 className="mt-2 font-display text-xl font-bold text-[#021d33] group-hover:text-[#005B96]">
        {copy.label}
      </h3>
      <p className="mt-2 text-sm text-slate-600">{copy.description}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {cfg.topics.slice(0, 4).map((t) => (
          <li key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
            {t}
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96]">
        {copy.enter} <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export async function V27AudienceGrid() {
  const locale = await getServerLocale();
  const grid = getV27AudienceGridCopy(locale);
  const keys: V27Audience[] = isCzechSurface(locale)
    ? ["public", "student", "physician", "b2b"]
    : ["public", "physician", "b2b"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          {grid.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
          {grid.title}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {keys.map((key) => (
          <V27AudienceHub key={key} audience={key} />
        ))}
      </div>
    </section>
  );
}
