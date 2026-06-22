import { Check, Minus } from "lucide-react";
import { V27_COMPARISON_FEATURES, V27_SUBSCRIPTION_PLANS } from "@/lib/v27/config";

function CellValue({ included }: { included: boolean }) {
  if (included) {
    return (
      <span className="inline-flex items-center justify-center text-emerald-600" aria-label="Zahrnuto">
        <Check className="h-5 w-5" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center text-slate-300" aria-label="Nezahrnuto">
      <Minus className="h-4 w-4" />
    </span>
  );
}

export function SubscriptionComparisonTable() {
  const tiers = V27_SUBSCRIPTION_PLANS;

  return (
    <section aria-labelledby="comparison-heading" className="mt-16">
      <h2 id="comparison-heading" className="font-display text-2xl font-semibold text-[#021d33]">
        Srovnání tarifů
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Přehled funkcí podle cílové skupiny — všechny tarify zahrnují 14denní zkušební verzi.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#005B96]/15 bg-white shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#005B96]/10 bg-[#f0f7ff]/60">
              <th scope="col" className="px-4 py-4 text-left font-semibold text-[#021d33]">
                Funkce
              </th>
              {tiers.map((plan) => (
                <th
                  key={plan.tier}
                  scope="col"
                  className="px-4 py-4 text-center font-semibold text-[#005B96]"
                >
                  <span className="block">{plan.name}</span>
                  <span className="mt-1 block text-lg font-bold text-[#021d33]">
                    {plan.monthlyCzk} Kč
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">/ měsíc</span>
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
                  {row.label}
                </th>
                <td className="px-4 py-3 text-center">
                  <CellValue included={row.public} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellValue included={row.student} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellValue included={row.physician} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
