import { Check, Minus } from "lucide-react";
import {
  V27_COMPARISON_FEATURES,
  V27_COMPARISON_TIERS,
  V27_SUBSCRIPTION_PLANS,
} from "@/lib/v27/config";
import { formatCzkListPrice } from "@/lib/i18n/payment-currency";
import { editorialMonthlyCharge } from "@/lib/editorial/pricing";
import { getSubscribeCopy } from "@/lib/i18n/subscribe-copy";
import { studentMonthlyCharge } from "@/lib/studenti/pricing";

function CellValue({ included, includedLabel, missingLabel }: { included: boolean; includedLabel: string; missingLabel: string }) {
  if (included) {
    return (
      <span className="inline-flex items-center justify-center text-emerald-600" aria-label={includedLabel}>
        <Check className="h-5 w-5" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center text-slate-300" aria-label={missingLabel}>
      <Minus className="h-4 w-4" />
    </span>
  );
}

export function SubscriptionComparisonTable({
  locale = "cs",
  region,
}: {
  locale?: string;
  region?: string | null;
}) {
  const copy = getSubscribeCopy(locale, region);
  const tiers = V27_COMPARISON_TIERS.map(
    (tier) => V27_SUBSCRIPTION_PLANS.find((p) => p.tier === tier)!
  ).filter(Boolean);

  return (
    <section aria-labelledby="comparison-heading" className="mt-16">
      <h2 id="comparison-heading" className="font-display text-2xl font-semibold text-[#021d33]">
        {copy.comparisonTitle}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.comparisonLead}</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#005B96]/15 bg-white shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#005B96]/10 bg-[#f0f7ff]/60">
              <th scope="col" className="px-4 py-4 text-left font-semibold text-[#021d33]">
                {copy.featureCol}
              </th>
              {tiers.map((plan) => (
                <th
                  key={plan.tier}
                  scope="col"
                  className="px-4 py-4 text-center font-semibold text-[#005B96]"
                >
                  <span className="block">{copy.plans[plan.tier].name}</span>
                  <span className="mt-1 block text-lg font-bold text-[#021d33]">
                    {plan.tier === "student"
                      ? studentMonthlyCharge(locale, region).formatted
                      : plan.tier === "public"
                        ? editorialMonthlyCharge(locale, region).formatted
                        : formatCzkListPrice(plan.monthlyCzk, locale, region)}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{copy.perMonth}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {V27_COMPARISON_FEATURES.map((row, idx) => (
              <tr
                key={row.label}
                className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
              >
                <th scope="row" className="px-4 py-3 text-left font-medium text-slate-700">
                  {copy.comparisonRows[idx] ?? row.label}
                </th>
                <td className="px-4 py-3 text-center">
                  <CellValue included={row.public} includedLabel={copy.included} missingLabel={copy.notIncluded} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellValue included={row.student} includedLabel={copy.included} missingLabel={copy.notIncluded} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellValue included={row.physician} includedLabel={copy.included} missingLabel={copy.notIncluded} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
