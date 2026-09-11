import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck } from "lucide-react";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangeMarketplaceHero({ locale }: { locale: string }) {
  const copy = getExchangeCopy(locale);
  const marketing = getExchangeMarketing(locale);
  const catalog = localizePublicHref("/exchange/catalog", locale);
  const onboard = localizePublicHref("/exchange/onboard", locale);
  const pricing = localizePublicHref("/exchange/pricing", locale);

  return (
    <section className="relative overflow-hidden border-b border-[#0a2a44] bg-[#021d33] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 12% 10%, rgba(196,163,90,0.28), transparent 34%), radial-gradient(circle at 88% 80%, rgba(0,91,150,0.45), transparent 42%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#c4a35a]/45 bg-[#c4a35a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#e8d5a3]">
          <Globe2 className="h-3.5 w-3.5" aria-hidden />
          MedScope · {copy.eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{copy.lead}</p>
        <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm font-medium text-[#e8d5a3]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {marketing.proof}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={catalog}
            className="inline-flex items-center rounded-full bg-[#c4a35a] px-6 py-3 text-sm font-semibold text-[#021d33] hover:bg-[#d4b56a]"
          >
            {copy.catalogCta}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={onboard}
            className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#021d33] hover:bg-slate-100"
          >
            {copy.onboardCta}
          </Link>
          <Link
            href={pricing}
            className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            {copy.pricingCta}
          </Link>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {marketing.stats.map((stat) => (
            <li key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
              <p className="font-display text-xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{stat.label}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2">
          {AVAILABILITY_REGIONS.map((region) => (
            <Link
              key={region}
              href={`${catalog}?regions=${region}`}
              className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#c4a35a] hover:text-[#e8d5a3]"
            >
              {regionLabel(region, locale)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
