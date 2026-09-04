import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ORDIZAPIS_APP } from "@/lib/apps/catalog";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { softwareApplicationJsonLd } from "@/lib/ecosystem/seo";
import { getOrdiZaznamCopy } from "@/lib/i18n/ordizaznam-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOrdiZaznamCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/ordizaznam",
  });
}

export default async function OrdiZaznamPage() {
  const locale = await getServerLocale();
  const region = await getServerRegion();
  const copy = getOrdiZaznamCopy(locale);
  const clinic = formatCzkListPrice(390, locale, region);
  const physician = formatCzkListPrice(490, locale, region);
  const demoHref = localizePublicHref("/app/dokumentace", locale);
  const subscribeHref = localizePublicHref("/predplatne", locale);
  const jsonLd = softwareApplicationJsonLd({
    name: copy.brand,
    description: copy.metaDescription,
    url: "https://medscopeglobal.com/app/dokumentace",
    price: String(ORDIZAPIS_APP.priceMonthlyCzk),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative isolate min-h-[min(92vh,900px)] overflow-hidden bg-[#021d33] text-white">
        <Image
          src={APP_MARKETING_IMAGE.ordizapis}
          alt=""
          fill
          priority
          sizes="100vw"
          className="mkt-drift object-cover object-[85%_center] opacity-60 sm:object-[80%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#021d33] from-0% via-[#021d33]/95 via-40% to-[#021d33]/20 to-100%"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#021d33] via-transparent to-[#021d33]/45"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(92vh,900px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:justify-center lg:pb-24">
          <div className="max-w-lg lg:max-w-xl">
            <h1 className="mkt-rise font-display text-[clamp(3rem,9vw,5.5rem)] font-bold leading-[0.94] tracking-tight">
              {copy.brand}
            </h1>
            <p className="mkt-rise-delay-1 mt-5 max-w-md text-lg leading-relaxed text-sky-50/85 sm:text-xl">
              {copy.hero}
            </p>
            <div className="mkt-rise-delay-2 mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={demoHref}
                className="inline-flex items-center gap-2 bg-white px-7 py-3.5 text-sm font-semibold text-[#005B96] transition hover:bg-sky-50"
              >
                {copy.tryDemo}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={subscribeHref}
                className="inline-flex items-center gap-2 border border-white/35 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {copy.trialCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
            {copy.whyTitle}
          </h2>
          <ol className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
            {copy.benefits.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-2 py-7 sm:grid-cols-[4rem_1fr] sm:items-baseline sm:gap-8"
              >
                <span className="font-display text-3xl font-bold text-[#005B96]/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#021d33]">{item.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f0f6fb] px-4 py-16 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,91,150,0.12),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            {copy.priceEyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
            {copy.priceTitle(clinic)}
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">{copy.priceNote(physician)}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={subscribeHref}
              className="inline-flex items-center gap-2 bg-[#005B96] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#004a7a]"
            >
              {copy.choosePlan}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={demoHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#005B96] underline-offset-4 hover:underline"
            >
              {copy.demoFirst}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-[#021d33]">{copy.legalTitle} </span>
          {copy.legal}
        </p>
      </section>

      <section className="bg-[#021d33] px-4 py-14 text-center text-white sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{copy.closeTitle}</h2>
        <p className="mt-2 text-white/65">{copy.closeLead}</p>
        <Link
          href={demoHref}
          className="mt-7 inline-flex items-center gap-2 bg-[#005B96] px-8 py-3.5 font-semibold transition hover:bg-[#004a7a]"
        >
          {copy.launch}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </>
  );
}
