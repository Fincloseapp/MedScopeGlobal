import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V271_B2B_PRICING, V271_B2B_PRICING_NOTE } from "@/lib/v271/b2b-pricing";

export function V271B2BPricingTable({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "mt-8" : "mt-0"} aria-labelledby="b2b-pricing-heading">
      <h2
        id="b2b-pricing-heading"
        className="font-display text-2xl font-semibold text-[#021d33]"
      >
        Transparentní B2B ceník
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Orientační ceny pro pharma, kliniky, laboratoře a univerzity. Bez skrytých poplatků.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {V271_B2B_PRICING.map((tier) => (
          <article
            key={tier.id}
            className={`flex flex-col rounded-2xl border p-5 ${
              tier.highlighted
                ? "border-[#005B96] bg-[#f0f7fc] shadow-[0_12px_30px_-24px_rgba(0,91,150,0.55)]"
                : "border-[#cfe1f3] bg-white"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
              {tier.name}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-[#021d33]">
              {tier.priceLabel}
              {tier.priceNote ? (
                <span className="ml-1 text-base font-normal text-slate-500">/ {tier.priceNote}</span>
              ) : null}
            </p>
            <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant={tier.highlighted ? "default" : "outline"}
              className={`mt-5 rounded-full ${tier.highlighted ? "bg-[#005B96]" : ""}`}
            >
              <Link href={tier.ctaHref}>{tier.ctaLabel}</Link>
            </Button>
          </article>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">{V271_B2B_PRICING_NOTE}</p>
    </section>
  );
}
