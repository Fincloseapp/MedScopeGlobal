import type { Metadata } from "next";
import { Suspense } from "react";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { CheckoutSuccessPanel } from "@/components/checkout/checkout-success-panel";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Platba úspěšná | MedScopeGlobal",
    description: "Děkujeme za vaši objednávku.",
    path: "/checkout/uspesne",
  });
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-slate-500">Načítám potvrzení…</div>}>
      <CheckoutSuccessPanel />
    </Suspense>
  );
}
