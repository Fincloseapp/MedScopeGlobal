import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MEDIFLOW, appSeoDescription, appSeoTitle } from "@/lib/apps/catalog";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedPageMetadata({
  title: appSeoTitle(MEDIFLOW),
  description: appSeoDescription(MEDIFLOW),
  path: "/mediflow",
});
}

const PILLARS = [
  {
    title: "Články z VitaScope",
    description: "Uložte si longevity a lifestyle texty na jedno místo.",
  },
  {
    title: "Symptomy a suplementy",
    description: "Denní přehled pro vás — ne pro diagnostiku.",
  },
  {
    title: "Poznámky offline",
    description: "Zápisky vždy po ruce, sync až když jste online.",
  },
] as const;

export default function MediFlowMarketingPage() {
  return (
    <div className="bg-[#071018] text-white">
      {/* Full-bleed hero — brand + one CTA on product atmosphere */}
      <section className="relative isolate min-h-[min(92vh,900px)] overflow-hidden">
        <div
          className="mkt-drift absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(16,185,129,0.4),transparent_48%),radial-gradient(ellipse_at_85%_70%,rgba(6,78,59,0.55),transparent_42%),linear-gradient(165deg,#030b10_0%,#0a1c28_50%,#05221a_100%)]"
          aria-hidden
        />

        {/* Product visual as edge-to-edge plane (not a card) */}
        <div
          className="mkt-fade pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#071018] via-[#071018]/35 to-transparent" />
          <div className="absolute inset-y-[8%] right-[6%] left-[18%] overflow-hidden rounded-l-[2.5rem] border border-emerald-400/20 border-r-0 bg-[#0c1a24]/75 shadow-[-40px_0_80px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <span className="font-display text-base font-semibold text-emerald-300">Dnes</span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">MediFlow deník</span>
            </div>
            <ul className="divide-y divide-white/8">
              {[
                { label: "Uloženo z VitaScope", detail: "Spánek a HRV — přehled týdne" },
                { label: "Symptom", detail: "Energie · mírná · ráno" },
                { label: "Suplement", detail: "Magnesium glycinát · večer" },
                { label: "Poznámka", detail: "Chůze 35 min po obědě" },
                { label: "VIP sync", detail: "Protokol spánku · aktivní" },
              ].map((row) => (
                <li key={row.label} className="px-6 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/85">
                    {row.label}
                  </p>
                  <p className="mt-1.5 text-[15px] text-white/88">{row.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[min(92vh,900px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:justify-center lg:pb-24">
          <div className="max-w-xl">
            <h1 className="mkt-rise font-display text-[clamp(3.25rem,10vw,6rem)] font-bold leading-[0.92] tracking-tight text-white">
              MediFlow
            </h1>
            <p className="mkt-rise-delay-1 mt-5 max-w-md text-lg leading-relaxed text-emerald-50/85 sm:text-xl">
              Osobní wellness deník — články, symptomy a suplementy na jednom místě.
            </p>
            <div className="mkt-rise-delay-2 mt-9 flex flex-wrap items-center gap-5">
              <Link
                href="/app/mediflow"
                className="inline-flex items-center gap-2 bg-emerald-400 px-7 py-3.5 text-sm font-semibold text-[#041018] transition hover:bg-emerald-300"
              >
                Spustit MediFlow
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/vip/protokoly"
                className="text-sm font-medium text-emerald-100/75 underline-offset-4 hover:text-white hover:underline"
              >
                VIP protokoly
              </Link>
            </div>
          </div>

          {/* Mobile product strip — same content, not a card grid */}
          <div className="mkt-fade mt-14 overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#0c1a24]/80 lg:hidden">
            <div className="border-b border-white/10 px-4 py-3 font-display text-sm font-semibold text-emerald-300">
              Náhled deníku
            </div>
            <ul className="divide-y divide-white/8">
              {[
                { label: "Článek", detail: "Spánek a HRV" },
                { label: "Symptom", detail: "Energie · mírná" },
                { label: "Suplement", detail: "Magnesium · večer" },
              ].map((row) => (
                <li key={row.label} className="px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/85">
                    {row.label}
                  </p>
                  <p className="mt-0.5 text-sm text-white/85">{row.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0a141c] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Tři věci, které MediFlow drží pohromadě
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            Jednoduchý deník napojený na VitaScope — bez dashboardového šumu.
          </p>
          <ol className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {PILLARS.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-2 py-6 sm:grid-cols-[4rem_1fr] sm:items-baseline sm:gap-8"
              >
                <span className="font-display text-3xl font-bold text-emerald-400/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/65">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
        <GlobalAdSlot placement="in-content" locale="cs" />
      </div>

      <section className="px-4 py-14 text-center sm:px-6">
        <p className="text-sm text-white/55">
          MediFlow neslouží k diagnostice. Obsah není lékařská rada.
        </p>
        <Link
          href="/app/mediflow"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          Vyzkoušet zdarma
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
