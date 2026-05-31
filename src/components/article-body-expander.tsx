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

type RichBlock =
  | { type: "h2" | "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseRichContent(content: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  const lines = content.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") });
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
      continue;
    }

    if (line.startsWith("- ")) {
      const items = [line.replace(/^-\s+/, "")];
      while (lines[index + 1]?.startsWith("- ")) {
        index += 1;
        items.push(lines[index].replace(/^-\s+/, ""));
      }
      blocks.push({ type: "list", items });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
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
  if (!hasFullAccess) {
    const sentences = splitIntoSentences(content);
    const preview = sentences[0] ?? content;
    return <p className="article-preview">{preview}</p>;
  }

  return (
    <section className="article-body-expander is-open" aria-labelledby="full-article-title">
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
  const blocks = parseRichContent(content);

  return (
    <div className="article-full-body" id={id}>
      <span id={id ? `${id}-title` : undefined} className="sr-only">
        Celý článek
      </span>
      {blocks.length
        ? blocks.map((block, index) => {
            if (block.type === "h2") return <h2 key={`${block.text}-${index}`}>{block.text}</h2>;
            if (block.type === "h3") return <h3 key={`${block.text}-${index}`}>{block.text}</h3>;
            if (block.type === "list") {
              return (
                <ul key={`list-${index}`}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={`${block.text}-${index}`}>{block.text}</p>;
          })
        : <p>{content}</p>}
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
