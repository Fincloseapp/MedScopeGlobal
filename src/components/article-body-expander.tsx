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
  const sentences = splitIntoSentences(content);
  const preview = sentences[0] ?? content;

  if (!hasFullAccess) {
    return <p className="article-preview">{preview}</p>;
  }

  return (
    <section className="article-body-expander is-open" aria-labelledby="full-article-title">
      <div className="article-preview">
        <h2>Úvod článku</h2>
        <p>{preview}</p>
      </div>
      <ArticleFullBody
        id="full-article"
        content={content}
        summary={summary}
        specialization={specialization}
        source={source}
        sourceUrl={sourceUrl}
        tags={tags}
      />
    </section>
  );
}

export function ArticleFullBody({
  id,
  content,
  summary,
  specialization,
  source,
  sourceUrl,
  tags
}: Omit<ArticleBodyExpanderProps, "hasFullAccess"> & { id?: string }) {
  const fullText = splitIntoSentences(content);

  return (
    <div className="article-full-body" id={id}>
      <section>
        <h3 id={id ? `${id}-title` : undefined}>Celý článek</h3>
        {(fullText.length ? fullText : [content]).map((paragraph) => (
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
  );
}
