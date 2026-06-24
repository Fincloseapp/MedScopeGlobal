import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { SITE } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "B2B ceník pro firmy",
  description:
    "Transparentní ceník pro pharma, kliniky a univerzity — banner od 5 000 Kč/měs., sponzorovaný článek 15 000 Kč, enterprise na míru.",
  path: "/firmy/cenik",
});

export default function FirmyCenikPage() {
  return (
    <ModulePageShell
      eyebrow="B2B ceník"
      title="Ceník pro firmy a partnery"
      description="Bez skrytých poplatků — orientační ceny pro bannery, sponzorované články a enterprise kampaně na MedScopeGlobal."
      ctaHref="/inzerce/formular"
      ctaLabel="Poptat nabídku"
    >
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Drobečková navigace">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <Link href="/b2b" className="hover:text-foreground">
          B2B
        </Link>
        <span className="mx-2">/</span>
        <span>Ceník</span>
      </nav>

      <V271B2BPricingTable />

      <div className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#f8fbff] p-6">
        <h2 className="font-display text-lg font-semibold text-[#021d33]">Proč inzerovat u nás?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Cílená audience: lékaři, studenti medicíny a informovaná veřejnost</li>
          <li>Editoriální standardy a etické označení sponzorovaného obsahu</li>
          <li>Měřitelné reporty zobrazení a kliknutí</li>
          <li>Odpověď na poptávku do 2 pracovních dnů</li>
        </ul>
      </div>

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
