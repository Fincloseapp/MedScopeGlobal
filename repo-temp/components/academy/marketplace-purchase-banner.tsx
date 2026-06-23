import Link from "next/link";
import { CheckCircle2, Clock, GraduationCap } from "lucide-react";

import type { MarketplacePurchaseStatus } from "@/lib/academy/marketplace-purchase";

export function MarketplacePurchaseBanner({
  purchase,
  canceled,
}: {
  purchase: MarketplacePurchaseStatus | null;
  canceled: boolean;
}) {
  if (canceled) {
    return (
      <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Platba byla zrušena. Můžete to zkusit znovu kdykoli.
      </p>
    );
  }

  if (!purchase) return null;

  if (purchase.pending) {
    return (
      <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-900">
        <Clock className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Platba přijata — aktivujeme přístup</p>
          <p className="mt-1 text-blue-800/90">
            {purchase.courseTitle
              ? `Kurz „${purchase.courseTitle}" bude brzy dostupný ve vašem postupu.`
              : "Kurz bude brzy dostupný ve vašem postupu."}{" "}
            Obnovte stránku za pár sekund.
          </p>
        </div>
      </div>
    );
  }

  if (!purchase.verified) return null;

  const courseHref = purchase.courseSlug ? `/academy/courses/${purchase.courseSlug}` : "/academy/courses";

  return (
    <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-900">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
      <div className="flex-1">
        <p className="font-medium">Nákup dokončen</p>
        <p className="mt-1 text-green-800/90">
          {purchase.courseTitle ? (
            <>
              Máte přístup ke kurzu <strong>{purchase.courseTitle}</strong>.
            </>
          ) : (
            "Kurz je nyní dostupný ve vašem postupu."
          )}
        </p>
        <Link
          href={courseHref}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#005B96] px-4 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
        >
          <GraduationCap className="h-4 w-4" />
          Začít studovat →
        </Link>
      </div>
    </div>
  );
}
