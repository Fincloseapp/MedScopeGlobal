import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V19ArticleBriefFeedLazy } from "@/components/v19/article-brief-feed";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getOdborneHubCopy } from "@/lib/i18n/odborne-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { isCzechSurface } from "@/lib/i18n/surface-copy";
import { getMedicalAiTexts, getStudySources } from "@/lib/queries/v4d/medical-ai";
import { SPECIALTY_LABELS_CS } from "@/lib/v4d/constants";
import type { V4dSpecialty } from "@/lib/v4d/constants";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/odborne",
    locale,
  });
}

export default async function OdbornePage() {
  const locale = await getServerLocale();
  const copy = getOdborneHubCopy(locale);
  const czech = isCzechSurface(locale);
  const [texts, sources] = await Promise.all([
    getMedicalAiTexts({ limit: 12 }),
    czech ? getStudySources() : Promise.resolve([]),
  ]);

  const byRegion = {
    cz: sources.filter((s) => s.region === "cz"),
    sk: sources.filter((s) => s.region === "sk"),
    eu: sources.filter((s) => s.region === "eu"),
    world: sources.filter((s) => s.region === "world"),
  };

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      ctaHref={localizePublicHref("/odborne/ai", locale)}
      ctaLabel={copy.cta}
      homeHref={localizePublicHref("/", locale)}
    >
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {copy.nav.map((item) => (
          <Link
            key={item.href}
            href={localizePublicHref(item.href, locale)}
            className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {czech ? (
        <V19ArticleBriefFeedLazy title={copy.briefyFeedTitle} limit={4} locale="cs" />
      ) : (
        <p className="mb-6 rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-600">
          {copy.briefyCsOnly}{" "}
          <Link href="/cs/odborne/briefy" className="font-semibold text-[#005B96] hover:underline">
            {copy.openCsBriefs}
          </Link>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {texts.map((t) => (
          <V4cContentCard
            key={t.id}
            href={localizePublicHref(`/odborne/${t.id}`, locale)}
            title={t.title}
            meta={[
              t.specialty ? SPECIALTY_LABELS_CS[t.specialty as V4dSpecialty] ?? t.specialty : null,
              t.source_name,
              t.quality_passed ? copy.qualityOk : copy.qualityReview,
            ]
              .filter(Boolean)
              .join(" · ")}
            summary={t.summary_clinician}
            badge={t.original_language?.toUpperCase() ?? "CS"}
          />
        ))}
      </div>
      {texts.length === 0 ? <p className="text-sm text-slate-600">{copy.empty}</p> : null}
      {czech && sources.length > 0 ? (
        <div className="mt-10 space-y-3 rounded-xl border border-dashed border-[#8dc4ea] bg-[#f8fcff] p-4 text-xs text-slate-600">
          <p className="font-semibold text-[#021d33]">{copy.sourcesTitle}</p>
          <p>
            <strong>ČR:</strong> {byRegion.cz.map((s) => s.name).join(", ")}
          </p>
          <p>
            <strong>SK:</strong> {byRegion.sk.map((s) => s.name).join(", ")}
          </p>
          <p>
            <strong>EU:</strong> {byRegion.eu.map((s) => s.name).join(", ")}
          </p>
          <p>
            <strong>Svět:</strong> {byRegion.world.map((s) => s.name).join(", ")}
          </p>
        </div>
      ) : !czech ? (
        <p className="mt-8 text-xs text-slate-500">{copy.sourcesNote}</p>
      ) : null}
    </ModulePageShell>
  );
}
