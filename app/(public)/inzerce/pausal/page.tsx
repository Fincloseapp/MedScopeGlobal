import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PausalOrderForm } from "@/components/sales/pausal-order-form";
import { formatSalesCzk, SALES_PACKAGES } from "@/lib/sales/packages";

export const metadata: Metadata = {
  title: "Měsíční paušál inzerce",
  description:
    "Autonomní obchodní oddělení MedScopeGlobal — měsíční paušály inzerce, faktura, předání poptávek.",
};

export default function InzercePausalPage() {
  return (
    <ModulePageShell
      eyebrow="Inzerce"
      title="Měsíční paušál na medscopeglobal.com"
      description="Firma platí paušál, dostane fakturu a plochy podle tarifu. Čtenářská poptávka na nabídku se předá, jen když je paušál aktivní. Vše označené jako inzerce."
      ctaHref="/inzerce/podminky"
      ctaLabel="Podmínky inzerce"
    >
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SALES_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-2xl border p-5 ${pkg.highlighted ? "border-[#005B96] bg-[#f3f9ff]" : "border-[#cfe1f3] bg-white"}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{pkg.name}</p>
            <p className="mt-2 font-display text-3xl font-bold text-[#021d33]">{formatSalesCzk(pkg.priceCzkMonth)}</p>
            <p className="text-xs text-slate-500">měsíčně · neplátce DPH</p>
            <p className="mt-2 text-sm text-slate-600">{pkg.tagline}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {pkg.features.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <h2 className="mb-4 font-display text-2xl font-semibold text-[#021d33]">Objednat paušál</h2>
      <PausalOrderForm />
      <p className="mt-6 text-sm text-slate-600">
        Jednorázovou kampaň (banner / článek) objednáte ve{" "}
        <Link href="/inzerce/formular" className="text-[#005B96] underline">
          formuláři inzerce
        </Link>
        . Adresář aktivních inzerentů:{" "}
        <Link href="/partneri" className="text-[#005B96] underline">
          /partneri
        </Link>
        .
      </p>
    </ModulePageShell>
  );
}
