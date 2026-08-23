import type { Metadata } from "next";
import Link from "next/link";
import {
  Mic,
  Sparkles,
  FileCheck2,
  Shield,
  Layers,
  FileOutput,
  History,
  Lock,
} from "lucide-react";
import { DokumentaceWorkspace } from "@/components/lekari/dokumentace-workspace";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { DokumentaceTutorial } from "@/components/lekari/dokumentace-tutorial";
import { MediktorPhysicianGuide } from "@/components/lekari/mediktor-physician-guide";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { Button } from "@/components/ui/button";
import { MediktorMark } from "@/components/lekari/mediktor-mark";
import { MEDIKTOR_APP } from "@/lib/apps/catalog";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { MEDIKTOR_MARKETING } from "@/lib/lekari/dokumentace/marketing-content";

const CAPABILITY_ICONS = {
  voice: Mic,
  structure: Layers,
  templates: Sparkles,
  export: FileOutput,
  sync: History,
  privacy: Lock,
} as const;

const VALUE_ICONS = [Mic, Sparkles, FileCheck2, Shield] as const;

export async function generateMetadata(): Promise<Metadata> {
  const base = buildV20PageMetadata({
    title: MEDIKTOR.seoTitle,
    description: MEDIKTOR.seoDescription,
    path: MEDIKTOR.routes.marketing,
  });

  return {
    ...base,
    manifest: MEDIKTOR_APP.manifest,
    appleWebApp: {
      capable: true,
      title: MEDIKTOR.pwaName,
      statusBarStyle: "default",
    },
    icons: {
      icon: [{ url: MEDIKTOR.assets.icon192 }, { url: MEDIKTOR.assets.icon512 }],
      apple: [{ url: MEDIKTOR.assets.appleTouch }],
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-title": MEDIKTOR.pwaShortName,
      "theme-color": "#005B96",
    },
  };
}

export default function LekariMediktorPage() {
  const m = MEDIKTOR_MARKETING;
  const hero = m.hero;
  const pricing = m.pricingHighlight;

  return (
    <div className="bg-[#fafcff]">
      <section className="relative overflow-hidden border-b border-[#d9e8f4]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,91,150,0.18),transparent_50%),radial-gradient(ellipse_at_90%_20%,rgba(2,29,51,0.12),transparent_45%),linear-gradient(165deg,#021d33_0%,#005B96_55%,#0a7ab8_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <MediktorMark
              size="xl"
              priority
              className="rounded-[22%] ring-2 ring-white/25 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)]"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">
                Pro lékaře · {MEDIKTOR.domain}
              </p>
              <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                {MEDIKTOR.shortName}
              </h1>
              <p className="mt-2 text-base font-medium text-sky-100">{MEDIKTOR.tagline}</p>
              <p className="mt-1 text-sm font-medium text-sky-200/90">{hero.subline}</p>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-sky-100/95">
            {MEDIKTOR.pitch} Samostatně {MEDIKTOR.priceMonthlyCzk} Kč/měsíc včetně práv balíčku
            Lékař v praxi · 14 dní zdarma.
          </p>
          <p className="mt-2 text-sm text-sky-200/80">{hero.support}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50">
              <a href={hero.ctaPrimary.href}>{hero.ctaPrimary.label}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10">
              <a href={hero.ctaSecondary.href}>{hero.ctaSecondary.label}</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10"
            >
              <Link href="/predplatne#dokumentace">{MEDIKTOR.priceMonthlyCzk} Kč / měsíc</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-sky-100/80">
            {`Stažení jen pro ověřené lékaře — účet MedScopeGlobal · ${MEDIKTOR.domain}`}
          </p>
        </div>
      </section>

      <section id="ukazka" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <DokumentaceTutorial variant="full" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
          {m.capabilities.title}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{m.capabilities.intro}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {m.capabilities.items.map((item) => {
            const Icon = CAPABILITY_ICONS[item.id as keyof typeof CAPABILITY_ICONS] ?? Sparkles;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm"
              >
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

      <section id="stahnout" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <DokumentaceDownloadPanel variant="marketing" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-[#005B96]/25 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
            {pricing.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[#021d33]">{pricing.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{pricing.body}</p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {pricing.bullets.map((bullet) => (
              <li key={bullet}>✓ {bullet}</li>
            ))}
          </ul>
          <div className="mt-6 max-w-md space-y-2">
            <V27CheckoutButton
              kind="subscription"
              productId="dokumentace-month"
              label={`${pricing.trialLabel} — ${MEDIKTOR.priceMonthlyCzk} Kč`}
            />
            <p className="text-center text-xs text-slate-500">
              Nebo{" "}
              <Link href={pricing.altLinkHref} className="text-[#005B96] underline">
                {pricing.altLinkLabel}
              </Link>{" "}
              — MeDiktor je levnější vstup se stejnými právy.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-[#021d33]">{m.workflowStrip.title}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">{m.workflowStrip.body}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {m.valueProps.map(({ id, title, text }, index) => {
            const Icon = VALUE_ICONS[index] ?? Sparkles;
            return (
              <div key={id} className="border-l-2 border-[#005B96] pl-4">
                <Icon className="h-5 w-5 text-[#005B96]" />
                <h3 className="mt-3 font-display text-lg font-semibold text-[#021d33]">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#d9e8f4] bg-[#eef6fb]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm leading-6 text-[#021d33]">{m.footerCta.priceLine}</p>
          <Button asChild className="shrink-0 rounded-full bg-[#005B96]">
            <Link href={m.footerCta.subscribeHref}>{m.footerCta.subscribeLabel}</Link>
          </Button>
        </div>
      </section>

      <section id="navod" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold text-[#021d33]">
          Návod pro lékaře
        </h2>
        <div className="rounded-3xl border border-[#cfe1f3] bg-white p-2 sm:p-4">
          <MediktorPhysicianGuide variant="compact" />
        </div>
      </section>

      <section id="workspace" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold text-[#021d33]">
          Pracovní prostor
        </h2>
        <DokumentaceWorkspace />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-[#cfe1f3] bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-[#021d33]">{m.hospitals.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{m.hospitals.text}</p>
          <Button asChild className="mt-4 rounded-full bg-[#005B96]">
            <Link href={m.hospitals.cta.href}>{m.hospitals.cta.label}</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-[#d9e8f4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-xl font-bold text-[#021d33]">{m.legal.title}</h2>
          <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            {m.legal.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
