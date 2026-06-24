import Link from "next/link";

/** Roadmap-ready UI for future AI/data products — no fake backend calls. */
export function AiRoadmapSection() {
  return (
    <section className="section ai-roadmap" aria-labelledby="ai-roadmap-heading">
      <p className="eyebrow">AI &amp; data roadmap</p>
      <h2 id="ai-roadmap-heading">Připraveno pro inteligentní vrstvu znalostí</h2>
      <p className="lead">
        Architektura platformy je modulární pro AI shrnutí, evidence digesty, personalizované dashboardy a
        benchmark reporting. Produkční AI endpointy nejsou aktivní bez explicitní konfigurace.
      </p>
      <div className="grid two">
        <article className="card roadmap-card">
          <span className="tag">Připraveno</span>
          <h3>AI summaries</h3>
          <p>Rozhraní pro generování klinických shrnutí s audit trail a odbornou validací.</p>
        </article>
        <article className="card roadmap-card">
          <span className="tag">Připraveno</span>
          <h3>Evidence digests</h3>
          <p>Modul pro kurátorované přehledy studií napojený na premium tier.</p>
        </article>
        <article className="card roadmap-card">
          <span className="tag">Plánováno</span>
          <h3>Personalizace</h3>
          <p>Doporučení podle specializace, role a uloženého obsahu.</p>
        </article>
        <article className="card roadmap-card">
          <span className="tag">Plánováno</span>
          <h3>Institutional benchmarks</h3>
          <p>Agregované metriky pro licencované instituce.</p>
        </article>
      </div>
      <Link className="button" href="/premium">
        Premium &amp; data produkty
      </Link>
    </section>
  );
}
