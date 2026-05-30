import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "O platformě",
  description: "Mise, editorial positioning a technická architektura MedScopeGlobal.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "O platformě" }]} />
      <p className="eyebrow">Editorial mission</p>
      <h1>Prémiová medicínská platforma s globálním záběrem</h1>
      <p className="lead">
        MedScopeGlobal propojuje klinickou praxi, výzkum a institucionální partnery v jednom důvěryhodném ekosystému
        inspirovaném nejlepšími medical publishing standardy.
      </p>
      <div className="grid two">
        <article className="card">
          <h2>Editorial positioning</h2>
          <p>
            Kurátorovaný obsah s citacemi, odbornou validací a transparentním označením sponzorovaných materiálů.
          </p>
        </article>
        <article className="card">
          <h2>Technická kvalita</h2>
          <p>
            Next.js 16, Prisma/Supabase, RBAC portál, analytics instrumentace, security headers a CI pipeline.
          </p>
        </article>
      </div>
      <section className="card">
        <h2>Kontakt a spolupráce</h2>
        <p>
          Obecný kontakt: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
        <p>
          B2B / partnerství: <a href={`mailto:${siteConfig.adsEmail}`}>{siteConfig.adsEmail}</a>
        </p>
        <div className="actions">
          <Link className="button primary" href="/institutions">
            Institucionální spolupráce
          </Link>
          <Link className="button" href="/portal">
            Odborný portál
          </Link>
        </div>
      </section>
    </main>
  );
}
