import Link from "next/link";
import { medicalSpecializations } from "@/lib/portal/specializations";
import { getSessionUser } from "@/lib/portal/request";
import { listArticles } from "@/lib/portal/repository";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function PortalArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  const query = first(params.q);
  const specialization = first(params.specialization);
  const sort = first(params.sort) as "newest" | "oldest" | "relevance" | "rating" | "";
  const articles = await listArticles(
    {
      query: query || undefined,
      specialization: specialization || undefined,
      status: "published",
      sort: sort || "newest"
    },
    user?.id,
    user?.role
  );

  return (
    <main className="section">
      <p className="eyebrow">Knihovna článků</p>
      <h1>Odborné medicínské články</h1>
      <form className="filter-bar portal-filter" method="get">
        <input name="q" placeholder="Fulltextové vyhledávání…" defaultValue={query} />
        <select name="specialization" defaultValue={specialization}>
          <option value="">Všechny obory</option>
          {medicalSpecializations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort || "newest"}>
          <option value="newest">Nejnovější</option>
          <option value="oldest">Nejstarší</option>
          <option value="relevance">Relevance</option>
          <option value="rating">Hodnocení</option>
        </select>
        <button className="button primary" type="submit">
          Filtrovat
        </button>
      </form>

      {articles.length ? (
        <div className="grid">
          {articles.map((article) => (
            <article className="card" key={article.id}>
              <div className="meta">
                <span className="tag">{article.specialization}</span>
                {article.ratingCount ? <span>{(article.ratingSum / article.ratingCount).toFixed(1)}/5</span> : null}
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <div className="meta">
                <span>{article.authorName}</span>
                <span>{article.publishedAt ? new Intl.DateTimeFormat("cs-CZ").format(new Date(article.publishedAt)) : ""}</span>
              </div>
              <Link className="button primary" href={`/portal/articles/${article.slug}`}>
                Číst článek
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>Žádné články neodpovídají filtru</h2>
          <p>Zkuste změnit vyhledávání nebo obor.</p>
        </div>
      )}
    </main>
  );
}
