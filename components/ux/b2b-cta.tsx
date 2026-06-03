import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function B2bCta({ locale = "cs" }: { locale?: string }) {
  const isCs = locale === "cs";

  return (
    <aside
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-card"
      aria-label={isCs ? "B2B spolupráce" : "B2B partnership"}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-medical-navy text-white">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-medical-navy dark:text-foreground">
            {isCs ? "Pro instituce a firmy" : "For institutions & companies"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCs
              ? "Licence pro nemocnice, vysoké školy a farmaceutické firmy. Individuální onboarding."
              : "Licenses for hospitals, universities and pharma. Custom onboarding."}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/contact">{isCs ? "Kontaktovat obchod" : "Contact sales"}</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
