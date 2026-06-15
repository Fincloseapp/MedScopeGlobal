import type { Metadata } from "next";
import Link from "next/link";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Platba úspěšná | MedScopeGlobal",
    description: "Děkujeme za vaši objednávku.",
    path: "/checkout/uspesne",
  });
}

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8">
        <h1 className="font-display text-2xl font-bold text-green-900">Platba proběhla úspěšně</h1>
        <p className="mt-3 text-sm text-green-800">
          Děkujeme za nákup. Potvrzení obdržíte e-mailem. Přístup k obsahu bude aktivován během několika
          minut.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            Domů
          </Link>
          <Link
            href="/predplatne"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ceník
          </Link>
        </div>
      </div>
    </div>
  );
}
