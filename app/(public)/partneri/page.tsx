import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { listPublicPartners } from "@/lib/sales/snapshot";
import { salesPackageById } from "@/lib/sales/packages";

export const metadata: Metadata = {
  title: "Inzerenti MedScopeGlobal",
  description: "Adresář firem s aktivním měsíčním paušálem inzerce. Označená inzerce.",
};

export default async function PartneriPage() {
  const partners = await listPublicPartners();
  return (
    <ModulePageShell
      eyebrow="Označená inzerce"
      title="Inzerenti s aktivním paušálem"
      description="Firmy, které platí měsíční paušál, mají veřejný profil a předání poptávek podle tarifu. Nejde o redakční doporučení."
      ctaHref="/inzerce/pausal"
      ctaLabel="Objednat paušál"
    >
      {partners.length === 0 ? (
        <p className="rounded-2xl border border-[#cfe1f3] bg-white px-5 py-6 text-sm text-slate-600">
          Zatím tu není aktivní paušál. Firmy se objednávají na{" "}
          <Link href="/inzerce/pausal" className="text-[#005B96] underline">
            /inzerce/pausal
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {partners.map((row) => (
            <Link
              key={row.slug}
              href={`/partneri/${row.slug}`}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-5 hover:border-[#005B96]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Inzerce</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-[#021d33]">{row.company}</h2>
              <p className="mt-1 text-sm text-slate-600">{row.offer || salesPackageById(row.packageId)?.tagline}</p>
            </Link>
          ))}
        </div>
      )}
    </ModulePageShell>
  );
}
