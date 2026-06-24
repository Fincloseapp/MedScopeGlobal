import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pro instituce",
  description: "Institucionální licence, enterprise přístup a B2B spolupráce pro nemocnice, univerzity a výzkum.",
  alternates: { canonical: "/institutions" }
};

const institutionTypes = [
  {
    title: "Nemocnice a klinická centra",
    points: ["Licencovaný přístup pro týmy", "Role-based segmentation", "Usage reporting (roadmap)"]
  },
  {
    title: "Univerzity a fakulty",
    points: ["Edukace a kurátorovaný obsah", "Expert verification workflow", "Event & education moduly"]
  },
  {
    title: "Výzkumné organizace",
    points: ["Evidence monitoring", "Data roundtables", "Benchmark whitepapers"]
  }
];

export default function InstitutionsPage() {
  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "Instituce" }]} />
      <p className="eyebrow">Institucionální licence</p>
      <h1>Enterprise přístup pro zdravotnické a vzdělávací organizace</h1>
      <p className="lead">
        Nejvyšší priorita obchodního modelu. Připravte demo, licenční poptávku nebo pilotní nasazení pro váš tým.
      </p>
      <div className="grid">
        {institutionTypes.map((item) => (
          <article className="card" key={item.title}>
            <h2>{item.title}</h2>
            <ul className="highlights">
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <section className="card">
        <h2>Co získáte</h2>
        <div className="metrics">
          <article className="metric">
            <strong>RBAC</strong>
            <span>Role &amp; audit</span>
            <p>Reader, expert, admin vrstvy s ověřením odborníků.</p>
          </article>
          <article className="metric">
            <strong>SSO</strong>
            <span>Roadmap</span>
            <p>Připraveno pro SAML/OIDC integraci dle požadavku instituce.</p>
          </article>
          <article className="metric">
            <strong>SLA</strong>
            <span>Enterprise</span>
            <p>Produkční health endpointy a Supabase-backed persistence.</p>
          </article>
        </div>
      </section>
      <div className="grid two" style={{ marginTop: "1.5rem" }}>
        <ContactForm endpoint="/api/contact/partner" title="Institucionální poptávka" defaultTopic="Institucionální licence" leadSource="institutions" />
        <div className="card">
          <h2>Rychlý kontakt</h2>
          <p>
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </p>
          <Link className="button" href="/b2b">
            B2B partnerství
          </Link>
        </div>
      </div>
    </main>
  );
}
