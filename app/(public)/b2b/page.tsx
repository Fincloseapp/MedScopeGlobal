import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { SITE } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "B2B a pharma partnerství",
  description:
    "Měřitelné B2B kampaně, reklama a lead generation pro medicínské partnery — transparentní ceník od 5 000 Kč/měs.",
  path: "/b2b",
});

export default function B2BPage() {
  return (
    <ModulePageShell
      eyebrow="B2B"
      title="Pharma a odborní partneři"
      description="Bannery, sponzorované články a enterprise kampaně pro pharma, kliniky a univerzity."
      ctaHref="/inzerce/formular"
      ctaLabel="Kontaktovat obchod"
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>B2B</span>
      </nav>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { value: "5 000 Kč", label: "Banner / měsíc", desc: "Cílená viditelnost u lékařů a studentů" },
          { value: "15 000 Kč", label: "Sponzorovaný článek", desc: "Editoriálně zpracovaný odborný obsah" },
          { value: "2 dny", label: "Odpověď na poptávku", desc: "Individuální nabídka pro enterprise" },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
            <p className="font-display text-2xl font-bold text-[#021d33]">{m.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#005B96]">{m.label}</p>
            <p className="mt-1 text-xs text-slate-600">{m.desc}</p>
          </div>
        ))}
      </div>

      <V271B2BPricingTable />

      <p className="mt-6 text-sm">
        <Link href="/firmy/cenik" className="font-medium text-[#005B96] underline underline-offset-2">
          Kompletní ceník pro firmy →
        </Link>
      </p>

      <p className="mt-8 text-sm text-muted-foreground">
        Dotazy:{" "}
        <Link href="/kontakt" className="text-[#005B96] underline">
          kontakt
        </Link>{" "}
        nebo{" "}
        <a href={`mailto:${SITE.supportEmail}`} className="text-[#005B96] underline">
          {SITE.supportEmail}
        </a>
        .
      </p>
    </ModulePageShell>
  );
}
