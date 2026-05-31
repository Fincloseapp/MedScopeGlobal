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

type ArticleSection = {
  heading: string;
  paragraphs: string[];
  highlights: string[];
};

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

function parseSections(content: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;

  for (const block of parseRichContent(content)) {
    if (block.type === "h2") {
      current = { heading: block.text, paragraphs: [], highlights: [] };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = { heading: "Úvod", paragraphs: [], highlights: [] };
      sections.push(current);
    }

    if (block.type === "paragraph") current.paragraphs.push(block.text);
    if (block.type === "list") current.highlights.push(...block.items);
  }

  return sections;
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
  const sections = parseSections(content);

  return (
    <div className="article-full-body" id={id}>
      <span id={id ? `${id}-title` : undefined} className="sr-only">
        Celý článek
      </span>
      {sections.length
        ? sections.map((section) => (
            <section className="article-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.highlights.length ? (
                <ul className="highlights">
                  {section.highlights.map((item) => (
                    <li key={item}>
                      <strong>{item}</strong>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))
        : <p>{content}</p>}
      <section className="article-section clinical-box">
        <h2>Klinický význam</h2>
        <p>
          Téma spadá do oblasti <strong>{specialization}</strong>. MedScopeGlobal ho zobrazuje jako praktický
          rozcestník: co sledovat, proč je informace relevantní a jak ji bezpečně zasadit do kontextu veřejnosti,
          studentů nebo odborné přípravy.
        </p>
      </section>
      <section className="article-section practice-box">
        <h2>Doporučení pro praxi</h2>
        <p>{summary}</p>
        {tags.length ? (
          <p>
            Klíčové tagy: <strong>{tags.join(" / ")}</strong>.
          </p>
        ) : null}
      </section>
      <section className="article-section references">
        <h2>Zdroje a citace</h2>
        <ol>
          <li>
            <em>Zdroj monitoringu a výchozí materiál.</em> {source}.{" "}
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                Odkaz
              </a>
            ) : null}
          </li>
          <li>
            <em>Strukturovaný výtah pro veřejnost a studenty.</em> MedScopeGlobal Source Desk.
          </li>
        </ol>
      </section>
    </div>
  );
}
