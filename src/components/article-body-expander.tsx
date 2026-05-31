"use client";

import { useId, useState } from "react";

interface ArticleBodyExpanderProps {
  content: string;
  summary: string;
  specialization: string;
  source: string;
  sourceUrl?: string;
  tags: string[];
  hasFullAccess: boolean;
}

function splitIntoSentences(content: string) {
  return content
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function ArticleBodyExpander({
  content,
  summary,
  specialization,
  source,
  sourceUrl,
  tags,
  hasFullAccess
}: ArticleBodyExpanderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bodyId = useId();
  const sentences = splitIntoSentences(content);
  const preview = sentences[0] ?? content;
  const fullText = sentences.length > 1 ? sentences : [content];

  if (!hasFullAccess) {
    return <p className="article-preview">{preview}</p>;
  }

  return (
    <section className={isOpen ? "article-body-expander is-open" : "article-body-expander"} aria-labelledby={`${bodyId}-title`}>
      <div className="article-preview">
        <h2 id={`${bodyId}-title`}>Obsah článku</h2>
        <p>{preview}</p>
      </div>
      <button
        className="button primary article-expand-button"
        type="button"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? "Sbalit celý článek" : "Rozbalit celý článek"}
      </button>
      {isOpen ? (
        <div className="article-full-body" id={bodyId}>
          <section>
            <h3>Celý text</h3>
            {fullText.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
          <section>
            <h3>Proč je téma důležité</h3>
            <p>
              Téma spadá do oblasti <strong>{specialization}</strong>. MedScopeGlobal ho zobrazuje jako praktický
              rozcestník: co sledovat, proč je informace relevantní a jak ji bezpečně zasadit do kontextu veřejnosti,
              studentů nebo odborné přípravy.
            </p>
          </section>
          <section>
            <h3>Praktické využití pro čtenáře</h3>
            <p>{summary}</p>
            {tags.length ? (
              <p>
                Klíčové tagy: <strong>{tags.join(" / ")}</strong>.
              </p>
            ) : null}
          </section>
          <section>
            <h3>Zdroj a metadata</h3>
            <p>
              Zdroj:{" "}
              {sourceUrl ? (
                <a href={sourceUrl} target="_blank" rel="noreferrer">
                  {source}
                </a>
              ) : (
                <strong>{source}</strong>
              )}
              . Metadata článku pomáhají rozlišit veřejnou/studentskou úroveň od odborných nebo premium materiálů.
            </p>
          </section>
        </div>
      ) : null}
    </section>
  );
}
