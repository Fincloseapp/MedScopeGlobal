import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/config/site";

export function PremiumCta({ locale = "cs" }: { locale?: string }) {
  const isCs = locale === "cs";

  return (
    <aside
      className="rounded-2xl border border-[#C7E3FF] bg-gradient-to-br from-[#C7E3FF]/40 to-white p-6 shadow-sm dark:from-[#005B96]/20 dark:to-background"
      aria-label={isCs ? "Premium nabídka" : "Premium offer"}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005B96] text-white">
          <Crown className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-medical-navy dark:text-foreground">
            {isCs ? "MedScopeGlobal Premium" : "MedScopeGlobal Premium"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCs
              ? `VIP obsah, AI asistent a prioritní přístup od ${PRICING.vipMonthlyCzk} Kč/měsíc.`
              : `VIP content, AI assistant from ${PRICING.vipMonthlyCzk} CZK/month.`}
          </p>
          <Button asChild className="mt-4 bg-[#005B96] hover:bg-[#004874]">
            <Link href="/predplatne">{isCs ? "Zobrazit tarify" : "View plans"}</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
