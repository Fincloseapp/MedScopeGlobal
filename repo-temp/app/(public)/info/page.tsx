import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { SITE } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Informace o platformě",
  description:
    "Přehled sekcí, přístupových úrovní a funkcí MedScopeGlobal pro čtenáře a partnery.",
  path: "/info",
});

export default function InfoPage() {
  return (
    <ModulePageShell
      eyebrow="Informace"
      title="Informace o platformě MedScopeGlobal"
      description="Stručný přehled rubrik, přístupových úrovní a právních informací."
      ctaHref="/sections"
      ctaLabel="Prozkoumat sekce"
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>Informace</span>
      </nav>

      <div className="prose prose-slate max-w-none">
        <p>
          {SITE.name} publikuje odborný medicínský obsah v češtině pro různé cílové skupiny — od
          veřejnosti po ověřené lékaře. Platforma kombinuje kurátorské články, studijní sekce,
          newsletter a nástroje pro partnery.
        </p>

        <h2>Hlavní oblasti</h2>
        <ul>
          <li>
            <Link href="/verejnost">Veřejnost</Link> — srozumitelné zdravotní informace
          </li>
          <li>
            <Link href="/studium">Studenti</Link> — studium medicíny a přijímačky
          </li>
          <li>
            <Link href="/odborna">Odborníci</Link> — klinické briefy a odborný obsah
          </li>
          <li>
            <Link href="/sections">Sekce</Link> — tematické rubriky podle oboru medicíny
          </li>
        </ul>

        <h2>Právní a kontaktní informace</h2>
        <p>
          Podrobnosti o zpracování údajů, cookies a obchodních podmínkách najdete v sekcích{" "}
          <Link href="/privacy">Ochrana soukromí</Link>, <Link href="/terms">Podmínky</Link> a{" "}
          <Link href="/kontakt">Kontakt</Link>.
        </p>
      </div>
    </ModulePageShell>
  );
}
