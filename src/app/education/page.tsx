import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { educationSeries } from "@/lib/education-catalog";

export const metadata: Metadata = {
  title: "Vzdělávání",
  description: "Webináře, hybridní programy a odborné série s CPD-ready architekturou.",
  alternates: { canonical: "/education" }
};

export default function EducationPage() {
  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "Vzdělávání" }]} />
      <p className="eyebrow">Vzdělávání</p>
      <h1>Webináře, programy a odborné série</h1>
      <p className="lead">
        Propojení eventů, edukačních sérií a budoucí CME/CPD vrstvy. Sponzorovaný obsah je explicitně označen.
      </p>
      <div className="grid">
        {educationSeries.map((series) => (
          <article className="card" key={series.id}>
            <div className="meta">
              <span className="tag">{series.format}</span>
              <span className="tag">{series.level}</span>
              {series.sponsored ? <span className="tag sponsored">Sponzorováno</span> : null}
              {series.cmeLabel ? <span className="tag">{series.cmeLabel}</span> : null}
            </div>
            <h2>{series.title}</h2>
            <p>{series.summary}</p>
            <div className="meta">
              <span>{series.specialization}</span>
              <span>{series.duration}</span>
            </div>
            <Link className="button primary" href={series.href}>
              Detail programu
            </Link>
          </article>
        ))}
      </div>
      <section className="card">
        <h2>Registrace na akce</h2>
        <p>Pro registraci použijte detail konkrétní události nebo kontaktujte organizátora.</p>
        <Link className="button" href="/events">
          Kalendář událostí
        </Link>
      </section>
    </main>
  );
}
