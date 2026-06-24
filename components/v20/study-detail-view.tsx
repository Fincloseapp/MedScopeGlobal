import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { V20StudyDisplay } from "@/lib/v20/studies/types";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { V23TakeawaysBox } from "@/components/v23/takeaways-box";
import { SITE } from "@/lib/config/site";
import { medicalWebPageJsonLd } from "@/lib/seo/json-ld";

export function V20StudyDetailView({ study }: { study: V20StudyDisplay }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: study.titleCs,
    description: study.summaryCs,
    datePublished: study.publishedDate,
    inLanguage: "cs-CZ",
    author: { "@type": "Organization", name: study.source.name },
    publisher: { "@type": "Organization", name: "MedScopeGlobal", url: SITE.url },
    mainEntityOfPage: `${SITE.url}/studie/${study.slug}`,
    image: study.imageUrl,
    identifier: [
      study.doi ? { "@type": "PropertyValue", propertyID: "DOI", value: study.doi } : null,
      study.pubmedId
        ? { "@type": "PropertyValue", propertyID: "PMID", value: study.pubmedId }
        : null,
    ].filter(Boolean),
  };

  const sections = [
    { title: "Souhrn", body: study.summaryCs },
    { title: "Metodika", body: study.methodologyCs },
    { title: "Výsledky", body: study.resultsCs },
    { title: "Závěr", body: study.conclusionCs },
    { title: "Klinický dopad", body: study.clinicalImpactCs },
  ];

  const webPageLd = medicalWebPageJsonLd({
    title: study.titleCs,
    description: study.summaryCs.slice(0, 200),
    path: `/studie/${study.slug}`,
  });

  return (
    <article className="v20-study-detail">
      <JsonLdScript data={jsonLd} />
      <JsonLdScript data={webPageLd} />
      <Link href="/studie" className="text-sm font-medium text-primary hover:underline">
        ← Zpět na studie
      </Link>

      <header className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          {study.specialtyCs} · {study.studyTypeLabel}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#021d33] sm:text-4xl">
          {study.titleCs}
        </h1>
        <p className="mt-2 text-lg text-slate-600">{study.subtitleCs}</p>
      <p className="mt-3 text-sm text-slate-500">
        {study.publishedDateLabel} · Relevance: {study.relevance} · Zdroj: {study.source.name}
        {study.doi && !study.doi.includes("example") ? ` · DOI: ${study.doi}` : ""}
        {study.pubmedId ? ` · PMID: ${study.pubmedId}` : ""}
      </p>
      </header>

      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={study.imageUrl}
          alt={study.titleCs}
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>

      <V23TakeawaysBox points={study.keyPointsCs} />

      <div className="mt-8 space-y-8">
        {sections.map((sec) => (
          <section key={sec.title}>
            <h2 className="font-display text-xl font-semibold text-[#021d33]">{sec.title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-700">{sec.body}</p>
          </section>
        ))}
      </div>

      <aside className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="font-display text-lg font-semibold text-[#021d33]">Metadata a zdroje</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Typ studie</dt>
            <dd className="font-medium">{study.studyTypeLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Obor</dt>
            <dd className="font-medium">{study.specialtyCs}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Jazyk</dt>
            <dd className="font-medium">Čeština</dd>
          </div>
          <div>
            <dt className="text-slate-500">Datum publikace</dt>
            <dd className="font-medium">{study.publishedDateLabel}</dd>
          </div>
          {study.doi && !study.doi.includes("example") && (
            <div>
              <dt className="text-slate-500">DOI</dt>
              <dd className="font-medium break-all">
                <a
                  href={`https://doi.org/${study.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {study.doi}
                </a>
              </dd>
            </div>
          )}
          {study.pubmedId && (
            <div>
              <dt className="text-slate-500">PubMed ID (PMID)</dt>
              <dd className="font-medium">
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${study.pubmedId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {study.pubmedId}
                </a>
              </dd>
            </div>
          )}
        </dl>
        <a
          href={study.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Původní zdroj ({study.source.agency})
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </aside>
    </article>
  );
}
