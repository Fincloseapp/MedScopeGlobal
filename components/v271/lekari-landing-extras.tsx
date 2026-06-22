import Link from "next/link";
import { Award, BadgeCheck, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  V271_LEKARI_CREDIBILITY,
  V271_PHYSICIAN_TIER,
  V271_SCIENTIFIC_RIGOR,
} from "@/lib/v271/lekari-credibility";

const BADGE_ICONS = {
  CME: BookOpen,
  "ČLK": ShieldCheck,
  "Peer review": BadgeCheck,
} as const;

export function V271LekariCredibilitySection() {
  return (
    <>
      <section className="mb-10" aria-labelledby="lekari-credibility-heading">
        <h2
          id="lekari-credibility-heading"
          className="font-display text-2xl font-semibold text-[#021d33]"
        >
          Důvěryhodnost pro klinickou praxi
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          MedScopeGlobal staví odborný obsah na ověřitelných zdrojích a transparentních
          standardech — ne na generických shrnutích.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {V271_LEKARI_CREDIBILITY.map((item) => {
            const Icon = BADGE_ICONS[item.badge as keyof typeof BADGE_ICONS] ?? Award;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#cfe1f3] bg-white p-5"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#005B96]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
                  <Icon className="h-3 w-3" aria-hidden />
                  {item.badge}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-[#021d33]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Partnerství s ČLK: ověření evidenčního čísla pro přístup do{" "}
          <Link href="/odborna" className="text-primary hover:underline">
            odborné sekce
          </Link>
          . CME akreditace — plánováno Q3 2026.
        </p>
      </section>

      <section
        className="mb-10 rounded-2xl border border-[#cfe1f3] bg-[#f0f7fc] p-6"
        aria-labelledby="scientific-rigor-heading"
      >
        <h2
          id="scientific-rigor-heading"
          className="font-display text-xl font-semibold text-[#021d33]"
        >
          {V271_SCIENTIFIC_RIGOR.headline}
        </h2>
        <p className="mt-2 text-sm text-slate-700">{V271_SCIENTIFIC_RIGOR.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {V271_SCIENTIFIC_RIGOR.identifiers.map((id) => (
            <span
              key={id}
              className="rounded-full border border-[#005B96]/30 bg-white px-3 py-1 text-xs font-semibold text-[#005B96]"
            >
              {id}
            </span>
          ))}
        </div>
        <Link
          href="/studie"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Prohlédnout kurátorované studie
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </section>
    </>
  );
}

export function V271PhysicianTierCard() {
  return (
    <section
      className="rounded-2xl border border-[#005B96] bg-white p-6 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)]"
      aria-labelledby="physician-tier-heading"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
        {V271_PHYSICIAN_TIER.tagline}
      </p>
      <h2
        id="physician-tier-heading"
        className="mt-2 font-display text-2xl font-bold text-[#021d33]"
      >
        {V271_PHYSICIAN_TIER.name} — {V271_PHYSICIAN_TIER.priceMonthly} Kč/měs.
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Roční plán {V271_PHYSICIAN_TIER.priceAnnual.toLocaleString("cs-CZ")} Kč (~2 měsíce zdarma)
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {V271_PHYSICIAN_TIER.valueProps.map((prop) => (
          <li key={prop} className="flex gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            {prop}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500">{V271_PHYSICIAN_TIER.comparisonNote}</p>
      <Button asChild className="mt-5 rounded-full bg-[#005B96]">
        <Link href={V271_PHYSICIAN_TIER.ctaHref}>{V271_PHYSICIAN_TIER.ctaLabel}</Link>
      </Button>
    </section>
  );
}
