import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AppDownloadPanel } from "@/components/apps/app-download-panel";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { APP_PRODUCTS, appLockline, appSeoDescription } from "@/lib/apps/catalog";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { AffiliateStrip } from "@/components/monetization/affiliate-strip";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Aplikace MedScopeGlobal — MediFlow, MeDipacient, OrdiZapis",
    description:
      "Wellness deník MediFlow, MeDipacient pro zprávy a OrdiZapis pro lékaře — plus legacy MeDiprep pro přípravu na LF. Stažení na mobil jako PWA.",
    path: "/aplikace",
  });
}

const HERO_APPS = APP_PRODUCTS.filter((a) => a.id !== "mediprep");

export default function AplikaceHubPage() {
  return (
    <div className="bg-[#07121c]">
      {APP_PRODUCTS.map((app) => (
        <JsonLdScript
          key={app.id}
          data={softwareApplicationJsonLd({
            name: app.shortName,
            description: appSeoDescription(app),
            url: app.marketingPath,
            installUrl: app.downloadPath,
            category: app.id === "mediprep" ? "EducationalApplication" : "HealthApplication",
          })}
        />
      ))}

      {/* Full-bleed apps hero — brand + product phones as visual plane */}
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
              Aplikace
              <span className="mt-1 block text-[0.55em] font-semibold tracking-normal text-sky-200/90">
                MedScopeGlobal
              </span>
            </h1>
            <p className="mkt-rise-delay-1 mt-5 max-w-md text-lg leading-relaxed text-sky-50/80 sm:text-xl">
              MediFlow, MeDipacient a OrdiZapis — wellness, zprávy a zápisy na jedné platformě.
            </p>
            <div className="mkt-rise-delay-2 mt-9 flex flex-wrap items-center gap-4">
                <Link
                href="/predplatne?trial=1"
                className="inline-flex items-center gap-2 bg-[#3db4ff] px-7 py-3.5 text-sm font-semibold text-[#021d33] transition hover:bg-[#6cc4ff]"
              >
                14 dní zdarma
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#katalog"
                className="text-sm font-medium text-sky-100/70 underline-offset-4 hover:text-white hover:underline"
              >
                Prohlédnout katalog
              </a>
            </div>
          </div>

          {/* Mobile visual strip */}
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

          return (
            <article
              key={app.id}
              className="border-b border-slate-200"
            >
              <div
                className={`mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 ${
                  reverse ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-200 sm:aspect-[5/4]">
                  <Image
                    src={APP_MARKETING_IMAGE[app.id]}
                    alt={`${app.shortName} — ${app.tagline}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${accent}`}>
                    {app.audience} · {appLockline(app)}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
                    {app.shortName}
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">{app.pitch}</p>
                  <p className="mt-2 text-sm font-medium text-[#005B96]">{app.priceNote}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={app.appPath}
                      className="inline-flex items-center gap-2 bg-[#021d33] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a2a44]"
                    >
                      Otevřít {app.shortName}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                      href={app.marketingPath}
                      className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-[#005B96] underline-offset-4 hover:underline"
                    >
                      Jak to funguje
                    </Link>
                  </div>
                  <div className="mt-8">
                    {app.id === "ordizapis" ? (
                      <DokumentaceDownloadPanel />
                    ) : (
                      <AppDownloadPanel app={app} />
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <AffiliateStrip locale="cs" limit={6} variant="section" title="Wellness & longevity katalog" />
    </div>
  );
}
