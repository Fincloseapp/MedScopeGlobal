import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Příprava na medicínu",
  description: "Materiály pro uchazeče o studium medicíny a středoškolské studenty.",
  alternates: { canonical: "/medicina/priprava" }
};

export default function MedicinaPripravaPage() {
  return (
    <main className="section">
      <Breadcrumbs
        items={[
          { label: "Domů", href: "/" },
          { label: "Medicína", href: "/medicina" },
          { label: "Příprava" }
        ]}
      />
      <p className="eyebrow">Příprava</p>
      <h1>Příprava na studium medicíny</h1>
      <p className="lead">
        Články, tipy a monitoring témat z biologie, chemie a veřejného zdraví — s důrazem na
        srozumitelnost a ověřené zdroje.
      </p>
      <div className="hero-actions">
        <Link className="button primary" href="/articles?audience=student">
          Články pro studenty
        </Link>
        <Link className="button" href="/pro-koho/laik-student">
          Profil laik / student
        </Link>
        <Link className="button" href="/auth/register">
          Registrace
        </Link>
      </div>
    </main>
  );
}
