import type { Metadata } from "next";
import Link from "next/link";
import { Mic, Sparkles, FileCheck2, Shield } from "lucide-react";
import { DokumentaceWorkspace } from "@/components/lekari/dokumentace-workspace";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { DokumentaceTutorial } from "@/components/lekari/dokumentace-tutorial";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { Button } from "@/components/ui/button";
import { OrdiZapisMark } from "@/components/lekari/ordizapis-mark";
import { ORDIZAPIS } from "@/lib/lekari/dokumentace/branding";
import { getDokumentaceCopy } from "@/lib/i18n/dokumentace-copy";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getDokumentaceCopy(locale);
  const base = await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/lekari/dokumentace",
  });

  return {
    ...base,
    manifest: "/dokumentace-manifest.json",
    appleWebApp: {
      capable: true,
      title: ORDIZAPIS.pwaName,
      statusBarStyle: "default",
    },
    icons: {
      icon: [{ url: ORDIZAPIS.assets.icon192 }, { url: ORDIZAPIS.assets.icon512 }],
      apple: [{ url: ORDIZAPIS.assets.appleTouch }],
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-title": ORDIZAPIS.pwaShortName,
      "theme-color": "#005B96",
    },
  };
}

const VALUE_ICONS = [Mic, Sparkles, FileCheck2, Shield] as const;

export default async function LekariDokumentacePage() {
  const locale = await getServerLocale();
  const region = await getServerRegion();
  const copy = getDokumentaceCopy(locale);
  const clinic = formatCzkListPrice(390, locale, region);
  const physician = formatCzkListPrice(490, locale, region);
  const clinicYear = formatCzkListPrice(3900, locale, region);
  const predplatneHref = localizePublicHref("/predplatne#dokumentace", locale);
  const physicianHref = localizePublicHref("/predplatne#physician", locale);

  return (
    <div className="bg-[#fafcff]">
      <section className="relative overflow-hidden border-b border-[#d9e8f4]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,91,150,0.18),transparent_50%),radial-gradient(ellipse_at_90%_20%,rgba(2,29,51,0.12),transparent_45%),linear-gradient(165deg,#021d33_0%,#005B96_55%,#0a7ab8_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <OrdiZapisMark
              size="xl"
              priority
              className="rounded-[22%] ring-2 ring-white/25 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)]"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">
                {copy.eyebrow} · {ORDIZAPIS.domain}
              </p>
              <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                {ORDIZAPIS.shortName}
              </h1>
              <p className="mt-2 text-base font-medium text-sky-100">{copy.tagline}</p>
              <p className="mt-1 text-sm font-medium text-sky-200/90">{ORDIZAPIS.lockline}</p>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-sky-100/95">
            {copy.pitch} {copy.heroPrice(clinic)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50">
              <a href="#stahnout">{copy.downloadQr}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10">
              <a href="#ukazka">{copy.howItWorks}</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10"
            >
              <Link href={predplatneHref}>{copy.monthlyCta(clinic)}</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-sky-100/80">
            {copy.verifiedOnly} · {ORDIZAPIS.domain}
          </p>
        </div>
      </section>

      <section id="ukazka" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <DokumentaceTutorial variant="full" locale={locale} />
      </section>

      <section id="stahnout" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <DokumentaceDownloadPanel variant="marketing" locale={locale} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-[#005B96]/25 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
            {copy.offerEyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[#021d33]">
            {copy.offerTitle(clinic)}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {copy.offerBody(physician, clinicYear)}
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {copy.offerItems.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
          <div className="mt-6 max-w-md space-y-2">
            <V27CheckoutButton
              kind="subscription"
              productId="dokumentace-month"
              label={copy.startTrial(clinic)}
              locale={locale}
            />
            <p className="text-center text-xs text-slate-500">
              <Link href={physicianHref} className="text-[#005B96] underline">
                {copy.orPhysician(physician)}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-[#021d33]">
          {copy.stepsTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">{copy.stepsLead}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {copy.valueProps.map((item, index) => {
            const Icon = VALUE_ICONS[index] ?? Mic;
            return (
              <div key={item.title} className="border-l-2 border-[#005B96] pl-4">
                <Icon className="h-5 w-5 text-[#005B96]" />
                <h3 className="mt-3 font-display text-lg font-semibold text-[#021d33]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#d9e8f4] bg-[#eef6fb]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm leading-6 text-[#021d33]">{copy.barNote(clinic)}</p>
          <Button asChild className="rounded-full bg-[#005B96] shrink-0">
            <Link href={predplatneHref}>{copy.showSubscribe}</Link>
          </Button>
        </div>
      </section>

      <section id="workspace" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold text-[#021d33]">
          {copy.workspaceTitle}
        </h2>
        {locale === "cs" ? (
          <DokumentaceWorkspace />
        ) : (
          <div className="rounded-3xl border border-[#cfe1f3] bg-white p-6 shadow-sm">
            <p className="max-w-2xl text-sm leading-6 text-slate-600">{copy.workspaceLead}</p>
            <Link
              href={localizePublicHref("/app/dokumentace", locale)}
              className="mt-4 inline-flex rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {copy.workspaceCta}
            </Link>
          </div>
        )}
      </section>

      <section className="border-t border-[#d9e8f4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-xl font-bold text-[#021d33]">
            {copy.legalTitle}
          </h2>
          <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            {copy.legal.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
