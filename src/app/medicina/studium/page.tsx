import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Studium medicíny",
  description: "Podpora pro studenty lékařských fakult během studia.",
  alternates: { canonical: "/medicina/studium" }
};

export default function MedicinaStudiumPage() {
  return (
    <main className="section">
      <Breadcrumbs
        items={[
          { label: "Domů", href: "/" },
          { label: "Medicína", href: "/medicina" },
          { label: "Studium" }
        ]}
      />
      <p className="eyebrow">Studium</p>
      <h1>Studium medicíny</h1>
      <p className="lead">
        Praktické přehledy, klinické dovednosti a výzkumné novinky pro studenty všech ročníků —
        propojené s denním monitoringem magazínu.
      </p>
      <div className="hero-actions">
        <Link className="button primary" href="/articles?audience=student">
          Student monitoring
        </Link>
        <Link className="button" href="/education">
          Vzdělávání a eventy
        </Link>
        <Link className="button" href="/portal/articles">
          Odborný portál
        </Link>
      </div>
    </main>
  );
}
