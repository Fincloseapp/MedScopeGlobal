import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { audienceSegments } from "@/lib/audience-segments";

export const metadata: Metadata = {
  title: "Pro koho",
  description: "Vyberte si profil čtenáře — laik, student, lékař nebo výzkumník.",
  alternates: { canonical: "/pro-koho" }
};

export default function ProKohoPage() {
  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "Pro koho" }]} />
      <p className="eyebrow">Čtenářské profily</p>
      <h1>Pro koho je MedScopeGlobal</h1>
      <p className="lead">
        Obsah a nástroje přizpůsobujeme třem hlavním skupinám. Vyberte profil, který nejlépe odpovídá
        vaší situaci.
      </p>
      <div className="grid">
        {audienceSegments.map((segment) => (
          <article key={segment.slug} className="card segment-card">
            <h2>{segment.title}</h2>
            <p>{segment.summary}</p>
            <ul className="highlights">
              {segment.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="hero-actions">
              <Link className="button primary" href={`/pro-koho/${segment.slug}`}>
                Detail profilu
              </Link>
              <Link className="button" href={segment.articleFilter}>
                Články pro vás
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
