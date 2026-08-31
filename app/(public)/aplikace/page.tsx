import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { APP_PRODUCTS, appLockline, type AppProductId } from "@/lib/apps/catalog";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).apps;
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/aplikace",
    locale,
  });
}

const HERO_APPS = APP_PRODUCTS.filter((a) => a.id !== "mediprep");

export default async function AplikaceHubPage() {
  const locale = await getServerLocale();
  const apps = getMarketingCopy(locale).apps;
  const subscribe = getSubscribeCopy(locale);
  const surface = getSurfaceCopy(locale);

  return (
    <div className="bg-[#07121c]">
      {APP_PRODUCTS.map((app) => (
        <JsonLdScript
          key={app.id}
          data={softwareApplicationJsonLd({
            name: app.shortName,
            description: `${app.shortName}: ${apps.pitch[app.id]} ${subscribe.priceNoteByApp[app.id] ?? app.priceNote}.`,
            url: localizePublicHref(app.marketingPath, locale),
            installUrl: app.downloadPath,
            category: app.id === "mediprep" ? "EducationalApplication" : "HealthApplication",
          })}
        />
      ))}

      <section className="relative isolate min-h-[min(92vh,900px)] overflow-hidden text-white">
        <div
          className="mkt-drift absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(0,91,150,0.35),transparent_50%),radial-gradient(ellipse_at_10%_80%,rgba(16,185,129,0.18),transparent_40%),linear-gradient(155deg,#041018_0%,#0a1e30_55%,#021d33_100%)]"
          aria-hidden
        />

        <div
          className="mkt-fade pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#07121c] via-[#07121c]/40 to-transparent" />
          <div className="absolute inset-y-[6%] right-0 left-[8%] grid grid-cols-3 items-stretch gap-3">
            {HERO_APPS.map((app, i) => (
              <div
                key={app.id}
                className={`relative min-h-0 overflow-hidden ${
                  i === 1 ? "mt-12 mb-4" : i === 2 ? "mt-6 mb-10" : "mt-20 mb-0"
                }`}
              >
                <Image
                  src={APP_MARKETING_IMAGE[app.id]}
                  alt=""
                  fill
                  sizes="18vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07121c]/90 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[min(92vh,900px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:justify-center">
          <div className="max-w-xl">
            <h1 className="mkt-rise font-display text-[clamp(2.75rem,8vw,5rem)] font-bold leading-[0.95] tracking-tight">
              {apps.title}
              <span className="mt-1 block text-[0.55em] font-semibold tracking-normal text-sky-200/90">
                MedScopeGlobal
              </span>
            </h1>
            <p className="mkt-rise-delay-1 mt-5 max-w-md text-lg leading-relaxed text-sky-50/80 sm:text-xl">
              {apps.lead}
            </p>
            <div className="mkt-rise-delay-2 mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={localizePublicHref("/predplatne?trial=1", locale)}
                className="inline-flex items-center gap-2 bg-[#3db4ff] px-7 py-3.5 text-sm font-semibold text-[#021d33] transition hover:bg-[#6cc4ff]"
              >
                {apps.trialCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#katalog"
                className="text-sm font-medium text-sky-100/70 underline-offset-4 hover:text-white hover:underline"
              >
                {apps.catalogCta}
              </a>
            </div>
          </div>

          <div className="mkt-fade mt-12 grid grid-cols-3 gap-2 lg:hidden">
            {HERO_APPS.map((app) => (
              <div key={app.id} className="relative aspect-[3/5] overflow-hidden">
                <Image
                  src={APP_MARKETING_IMAGE[app.id]}
                  alt=""
                  fill
                  sizes="30vw"
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="katalog" className="bg-[#f4f7fa]">
        {APP_PRODUCTS.map((app, index) => {
          const accent =
            app.id === "mediflow"
              ? "text-emerald-700"
              : app.id === "medipacient"
                ? "text-[#2D7FF9]"
                : app.id === "ordizapis"
                  ? "text-[#005B96]"
                  : "text-slate-600";
          const reverse = index % 2 === 1;
          const tagline = surface.appTaglines[app.id as AppProductId] ?? app.tagline;

          return (
            <article key={app.id} className="border-b border-slate-200">
              <div
                className={`mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 ${
                  reverse ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-200 sm:aspect-[5/4]">
                  <Image
                    src={APP_MARKETING_IMAGE[app.id]}
                    alt={`${app.shortName} — ${tagline}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${accent}`}>
                    {subscribe.audienceByApp[app.id] ?? app.audience} · {appLockline(app)}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
                    {app.shortName}
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                    {apps.pitch[app.id] ?? app.pitch}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#005B96]">
                    {subscribe.priceNoteByApp[app.id] ?? app.priceNote}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={app.appPath}
                      className="inline-flex items-center gap-2 bg-[#021d33] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a2a44]"
                    >
                      {apps.openApp} {app.shortName}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                      href={localizePublicHref(app.marketingPath, locale)}
                      className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-[#005B96] underline-offset-4 hover:underline"
                    >
                      {apps.howItWorks}
                    </Link>
                  </div>
                  <div className="mt-8">
                    {app.id === "ordizapis" ? (
                      <DokumentaceDownloadPanel />
                    ) : (
                      <AppDownloadPanel app={app} locale={locale} />
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
