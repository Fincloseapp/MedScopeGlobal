import Link from "next/link";
import { notFound } from "next/navigation";
import { getMedicalSection, sectionArticles, sectionEvents } from "@/lib/medical-sections";

export function MedicalSectionPage({ path }: { path: string }) {
  const section = getMedicalSection(path);
  if (!section) notFound();

  const articles = sectionArticles(section);
  const events = sectionEvents(section);

  return (
    <main className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{section.group}</p>
          <h1>{section.title}</h1>
          <p className="lead">{section.description}</p>
        </div>
        <Link className="button primary" href="/portal/articles">
          Procházet odborný portál
        </Link>
      </div>

      <section className="grid">
        {articles.slice(0, 3).map((article) => (
          <article className="card" key={article.id}>
            <div className="meta">
              <span className="tag">{article.specialization}</span>
              <span>{article.source}</span>
            </div>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <div className="meta">
              <span>{article.author}</span>
              <span>{new Intl.DateTimeFormat("cs-CZ").format(new Date(article.date))}</span>
              <span>{article.readingTime} min</span>
            </div>
            <Link className="button" href={`/articles/${article.slug}`}>
              Detail
            </Link>
          </article>
        ))}
      </section>

      {events.length > 0 ? (
        <section className="section related-section">
          <p className="eyebrow">Events feed</p>
          <h2>Relevantní kongresy a webináře</h2>
          <div className="grid">
            {events.slice(0, 3).map((event) => (
              <article className="card" key={event.id}>
                <span className="tag">{event.format}</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <Link className="button" href={`/events/${event.slug}`}>
                  Detail události
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
