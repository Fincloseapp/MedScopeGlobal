import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock,
  Mic,
  Shield,
  Smartphone,
  Stethoscope,
  Building2,
  ArrowRight,
} from "lucide-react";
import { DokumentaceDownloadPanel } from "@/components/lekari/dokumentace-download-panel";
import { DokumentaceTutorial } from "@/components/lekari/dokumentace-tutorial";
import { MediktorMark } from "@/components/lekari/mediktor-mark";
import { MediktorMarketingVideo } from "@/components/mediktor/mediktor-marketing-video";
import { MediktorStoreQrs } from "@/components/mediktor/mediktor-store-qrs";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { Button } from "@/components/ui/button";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { MEDIKTOR_MARKETING as C } from "@/lib/lekari/dokumentace/marketing-content";
import { MEDIKTOR_ONBOARDING } from "@/lib/mediktor/copy";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";
import { MediktorPwaRegister } from "@/components/lekari/dok-app/mediktor-pwa-register";
import { MediktorPhysicianGuide } from "@/components/lekari/mediktor-physician-guide";

const WHY_ICONS = [Clock, Stethoscope, Check, Shield, Smartphone] as const;

export function MediktorLanding() {
  const tiers = [MEDIKTOR.pricing.trial, MEDIKTOR.pricing.physician, MEDIKTOR.pricing.clinic];

  return (
    <div className="bg-[#f7fbff]">
      <MediktorPwaRegister />
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#cfe1f3]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(34,160,90,0.18),transparent_42%),radial-gradient(ellipse_at_85%_10%,rgba(0,91,150,0.35),transparent_48%),linear-gradient(165deg,#021d33_0%,#005B96_58%,#0670a8_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <MediktorMark
                size="lg"
                priority
                className="rounded-[22%] ring-2 ring-white/25 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)]"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                  {C.hero.providerLine}
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-200">Pro lékaře</p>
              </div>
            </div>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
              {MEDIKTOR.shortName}
              <span className="block text-sky-100"> – {MEDIKTOR.tagline}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-sky-50/95">{C.hero.subline}</p>
            <p className="mt-2 text-base font-medium text-emerald-200">{C.hero.support}</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-sky-100/85">{C.mobileEmphasis}</p>
            <p className="mt-4 max-w-xl text-base font-semibold text-emerald-200">
              {MEDIKTOR_ONBOARDING.marketing.startIn30}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100/90">
              {MEDIKTOR_ONBOARDING.marketing.otpBlurb}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <InstallAppButton variant="hero" tone="light" className="w-full sm:w-auto sm:min-w-[280px]" />
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50"
              >
                <Link href={`${MEDIKTOR.routes.app}?install=1`}>Vyzkoušet zdarma</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-sky-100/80">
              <Link href={`${MEDIKTOR.routes.download}?install=1`} className="underline underline-offset-2">
                Návod k instalaci na telefon i PC
              </Link>
            </p>
            <p className="mt-4 text-xs text-sky-100/75">
              E-mail + ověřovací kód (SMS zatím ne) · účet {MEDIKTOR.domain} ·{" "}
              {MEDIKTOR.supportPhone}
            </p>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)] backdrop-blur-sm">
              <Image
                src={MEDIKTOR.assets.heroFlyer}
                alt={`${MEDIKTOR.shortName} — diktujte, my zapisujeme`}
                width={682}
                height={1024}
                priority
                className="h-auto w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <MediktorMarketingVideo />

      {/* TUTORIAL (merged from former /lekari/dokumentace) */}
      <section id="ukazka" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <DokumentaceTutorial variant="full" />
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="font-display text-3xl font-bold text-[#021d33]">{C.whyDoctors.title}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Cílíme na lékaře v ambulanci i nemocnici — ne na veřejnost ani studenty.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {C.whyDoctors.items.map((item, i) => {
            const Icon = WHY_ICONS[i] ?? Check;
            return (
              <article key={item.title} className="border-l-2 border-[#005B96] pl-4">
                <Icon className="h-5 w-5 text-[#005B96]" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-semibold text-[#021d33]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-[#d9e8f4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-3xl font-bold text-[#021d33]">{C.howItWorks.title}</h2>
            <p className="text-sm font-semibold text-[#005B96]">{C.howItWorks.summary}</p>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {C.howItWorks.steps.map((step) => (
              <li key={step.n} className="relative rounded-xl bg-[#f0f7ff] px-5 py-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#005B96] text-sm font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-[#021d33]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/mediktor/navod">Celý návod pro lékaře</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/mediktor/navod#pacient">Co říct pacientovi</Link>
            </Button>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#cfe1f3]">
            <Image
              src={MEDIKTOR.assets.brandKit}
              alt={`${MEDIKTOR.shortName} — vizuální identita a bannery`}
              width={1400}
              height={900}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="font-display text-3xl font-bold text-[#021d33]">{C.benefits.title}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {C.benefits.items.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 text-sm leading-6 text-slate-700"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#22a05a]" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* AUDIENCE: ambulatory / hospital */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#cfe1f3] bg-white p-6">
            <Stethoscope className="h-6 w-6 text-[#005B96]" aria-hidden />
            <h2 className="mt-3 font-display text-2xl font-bold text-[#021d33]">
              {MEDIKTOR_ONBOARDING.marketing.ambulatoryTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {MEDIKTOR_ONBOARDING.marketing.ambulatoryText}
            </p>
          </article>
          <article className="rounded-2xl border border-[#cfe1f3] bg-white p-6">
            <Building2 className="h-6 w-6 text-[#005B96]" aria-hidden />
            <h2 className="mt-3 font-display text-2xl font-bold text-[#021d33]">
              {MEDIKTOR_ONBOARDING.marketing.hospitalTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {MEDIKTOR_ONBOARDING.marketing.hospitalText}
            </p>
          </article>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id="stahnout" className="border-y border-[#d9e8f4] bg-[#eef6fb]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold text-[#021d33]">
              Stáhnout MeDiktor
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              {MEDIKTOR_ONBOARDING.marketing.startIn30}{" "}
              {MEDIKTOR_ONBOARDING.marketing.otpBlurb}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <DokumentaceDownloadPanel variant="marketing" />
            <MediktorStoreQrs />
          </div>
        </div>
      </section>

      {/* START NOW */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="font-display text-3xl font-bold text-[#021d33]">{C.startNow.title}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">{C.startNow.text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {C.startNow.ctas.map((cta) => (
            <Button
              key={cta.label}
              asChild
              className={
                cta.label.includes("PWA")
                  ? "rounded-full bg-[#22a05a] hover:bg-[#1b874b]"
                  : "rounded-full bg-[#005B96] hover:bg-[#004a7a]"
              }
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="cenik" className="border-y border-[#d9e8f4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold text-[#021d33]">Ceník MeDiktor</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Jen MeDiktor — srozumitelné české ceny pro lékaře a zdravotnická zařízení.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {tiers.map((tier) => {
              const featured = tier.id === "physician";
              return (
                <article
                  key={tier.id}
                  className={
                    featured
                      ? "rounded-2xl border-2 border-[#005B96] bg-[#f0f7ff] p-6 shadow-sm"
                      : "rounded-2xl border border-[#d9e8f4] bg-[#fafcff] p-6"
                  }
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
                    {tier.name}
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-[#021d33]">
                    {tier.priceLabel}
                    {tier.period ? (
                      <span className="ml-1 text-base font-medium text-slate-500">
                        {tier.period}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{tier.detail}</p>
                  <div className="mt-6">
                    {tier.id === "physician" ? (
                      <V27CheckoutButton
                        kind="subscription"
                        productId={MEDIKTOR.pricing.physician.productId}
                        label={`${tier.cta} — ${MEDIKTOR.priceMonthlyCzk} Kč`}
                      />
                    ) : (
                      <Button
                        asChild
                        className={
                          featured
                            ? "w-full rounded-full bg-[#005B96]"
                            : "w-full rounded-full"
                        }
                        variant={featured ? "default" : "outline"}
                      >
                        <Link href={tier.href}>{tier.cta}</Link>
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Platební brána Stripe · {MEDIKTOR.trialDays} dní trial u tarifu Lékař · fakturace
            kliniky po domluvě.
          </p>
        </div>
      </section>

      {/* HOSPITALS */}
      <section id="nemocnice" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-[#005B96]/20 bg-gradient-to-br from-[#021d33] to-[#005B96] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Building2 className="h-7 w-7 text-emerald-300" aria-hidden />
              <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                {C.hospitals.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-sky-100/90 sm:text-base">
                {C.hospitals.text}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-12 shrink-0 rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50"
            >
              <Link href={C.hospitals.cta.href}>
                {C.hospitals.cta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Materiály:{" "}
          <Link href={MEDIKTOR.routes.prezentace} className="font-medium text-[#005B96] underline">
            prezentace pro nemocnice
          </Link>
          {" · "}
          <Link href={MEDIKTOR.routes.app} className="font-medium text-[#005B96] underline">
            otevřít aplikaci MeDiktor
          </Link>
        </p>
      </section>

      {/* PHYSICIAN GUIDE */}
      <section id="navod" className="border-t border-[#d9e8f4] bg-[#f7fbff]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <MediktorPhysicianGuide variant="full" />
        </div>
      </section>

      {/* LEGAL */}
      <section className="border-t border-[#d9e8f4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-xl font-bold text-[#021d33]">Právní rámec</h2>
          <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            {C.legal.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Podrobný postup, kopírování, napojení na NIS a přesná věta pro pacienta jsou v{" "}
            <Link href="#navod" className="font-medium text-[#005B96] underline">
              návodu výše
            </Link>
            {" · "}
            <Link href="/mediktor/navod" className="font-medium text-[#005B96] underline">
              /mediktor/navod
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
