import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EXCHANGE_LISTINGS } from "@/lib/b2b/exchange-listings";
import { MARKETPLACE_VISUALS } from "@/lib/brand/marketing-visuals";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/exchange",
    locale,
  });
}

export default async function ExchangePage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const firmyHref = localizePublicHref("/firmy", locale);
  const adsHref = localizePublicHref("/firmy/reklama/nova", locale);
  const contactHref = localizePublicHref("/kontakt", locale);

  return (
    <div className="bg-[#f4f7fa]">
      <header className="overflow-hidden border-b border-slate-200 bg-[#021d33] text-white">
        <div className="mx-auto grid max-w-6xl md:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)]">
          <div className="flex flex-col justify-center px-4 py-10 sm:px-8 sm:py-14">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8d5a3]">{copy.kicker}</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">
              {copy.leadBefore}{" "}
              <Link href={firmyHref} className="font-semibold text-[#e8d5a3] hover:underline">
                {copy.firmyLinkLabel}
              </Link>
              {copy.leadAfter}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={contactHref}
                className="rounded-full bg-[#c4a35a] px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-[#e8d5a3]"
              >
                {copy.registerCta}
              </Link>
              <Link
                href={adsHref}
                className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {copy.adsCta}
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/60">{copy.regions}</p>
          </div>
          <div className="relative min-h-[240px] md:min-h-full">
            <Image
              src={MARKETPLACE_VISUALS.workstation}
              alt={copy.heroAlt}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 480px"
            />
            <span className="absolute inset-0 bg-gradient-to-l from-transparent to-[#021d33]/35 md:bg-gradient-to-l" />
          </div>
        </div>
      </header>

      <ul className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6">
        {EXCHANGE_LISTINGS.map((item) => {
          const loc = copy.listings[item.id];
          return (
            <li
              key={item.id}
              id={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid md:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]"
            >
              <div className="relative min-h-[200px] bg-[#e8eef3]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width:768px) 100vw, 288px"
                />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
                  {loc.region} · {loc.category}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[#021d33]">{loc.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {loc.maker} · {loc.cert}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{loc.summary}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
