"use client";

import Link from "next/link";
import { useState } from "react";
import type { PortalArticle } from "@/lib/portal/types";

interface ArticleReaderProps {
  article: PortalArticle;
  related: PortalArticle[];
  canManage?: boolean;
  userRating?: number;
}

export function ArticleReader({ article, related, canManage, userRating }: ArticleReaderProps) {
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(userRating ?? 0);
  const [message, setMessage] = useState("");
  const avgRating = article.ratingCount ? (article.ratingSum / article.ratingCount).toFixed(1) : null;

  async function toggleSave() {
    const method = saved ? "DELETE" : "POST";
    const response = await fetch(`/api/portal/articles/${article.id}/save`, { method });
    if (response.ok) {
      setSaved(!saved);
      setMessage(saved ? "Článek odebrán z uložených" : "Článek uložen");
    } else {
      setMessage("Pro ukládání se přihlaste");
    }
  }

  async function submitRating(score: number) {
    const response = await fetch(`/api/portal/articles/${article.id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score })
    });
    if (response.ok) {
      setRating(score);
      setMessage("Hodnocení uloženo");
    } else {
      setMessage("Pro hodnocení se přihlaste");
    }
  }

  return (
    <main className="section portal-article">
      <article className="card article-detail">
        <div className="meta">
          <span className="tag">{article.specialization}</span>
          {article.icdCodes.map((code) => (
            <span className="tag icd" key={code}>
              ICD: {code}
            </span>
          ))}
          {article.validatedAt ? <span className="tag validated">Validováno</span> : null}
        </div>
        <h1>{article.title}</h1>
        <p className="lead">{article.summary}</p>
        <div className="meta">
          <span>Autor: {article.authorName}</span>
          <span>{article.publishedAt ? new Intl.DateTimeFormat("cs-CZ").format(new Date(article.publishedAt)) : "Koncept"}</span>
          <span>{article.readingTime} min čtení</span>
          {avgRating ? <span>Hodnocení: {avgRating}/5 ({article.ratingCount})</span> : null}
        </div>

        {article.tags.length ? (
          <div className="meta tag-row">
            {article.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="article-actions actions">
          <button className="button" type="button" onClick={toggleSave}>
            {saved ? "Odebrat z uložených" : "Uložit článek"}
          </button>
          <div className="rating-group" aria-label="Hodnocení článku">
            {[1, 2, 3, 4, 5].map((score) => (
              <button key={score} className={rating >= score ? "button primary rating-star" : "button rating-star"} type="button" onClick={() => submitRating(score)}>
                {score}
              </button>
            ))}
          </div>
          {canManage ? (
            <>
              <Link className="button" href={`/portal/manage/${article.id}/edit`}>
                Editovat
              </Link>
              <Link className="button primary" href={`/portal/manage`}>
                Správa
              </Link>
            </>
          ) : null}
        </div>
        {message ? <p className="success">{message}</p> : null}

        {article.sections.map((section) => (
          <section className="article-section" key={section.id}>
            <h2>{section.heading}</h2>
            <p>{section.content}</p>
            {section.highlights?.length ? (
              <ul className="highlights">
                {section.highlights.map((item) => (
                  <li key={item}>
                    <strong>{item}</strong>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="article-section clinical-box">
          <h2>Klinický význam</h2>
          <p>{article.clinicalSignificance}</p>
        </section>

        <section className="article-section practice-box">
          <h2>Doporučení pro praxi</h2>
          <p>{article.practiceRecommendations}</p>
        </section>

        <section className="article-section references">
          <h2>Zdroje a citace</h2>
          <ol>
            {article.citations.map((citation) => (
              <li key={citation.id}>
                {citation.authors ? `${citation.authors}. ` : ""}
                <em>{citation.title}</em>. {citation.sourceName}
                {citation.year ? ` (${citation.year})` : ""}.
                {citation.doi ? ` DOI: ${citation.doi}.` : ""}
                {citation.sourceUrl ? (
                  <>
                    {" "}
                    <a href={citation.sourceUrl} target="_blank" rel="noreferrer">
                      Odkaz
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      </article>

      {related.length ? (
        <section className="section related-section">
          <p className="eyebrow">Související články</p>
          <h2>Další obsah v oboru {article.specialization}</h2>
          <div className="grid">
            {related.map((item) => (
              <article className="card" key={item.id}>
                <span className="tag">{item.specialization}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <Link className="button" href={`/portal/articles/${item.slug}`}>
                  Číst článek
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
