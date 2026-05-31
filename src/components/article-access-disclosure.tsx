import Link from "next/link";

interface ArticleAccessDisclosureProps {
  accessLabel: string;
  audienceLabel: string;
  message: string;
  hasFullAccess: boolean;
  requiresSubscription: boolean;
  articleTargetId?: string;
  source: string;
  sourceUrl?: string;
}

export function ArticleAccessDisclosure({
  accessLabel,
  audienceLabel,
  message,
  hasFullAccess,
  requiresSubscription,
  articleTargetId = "full-article",
  source,
  sourceUrl
}: ArticleAccessDisclosureProps) {
  const isPublicStudent = hasFullAccess && !requiresSubscription;
  const sourceHref = sourceUrl || `#${articleTargetId}`;
  const isExternalSource = Boolean(sourceUrl?.startsWith("http"));

  if (isPublicStudent) {
    return (
      <section className="access-disclosure success-disclosure" aria-label="Dostupnost článku">
        <a
          className="access-disclosure-trigger"
          href={sourceHref}
          target={isExternalSource ? "_blank" : undefined}
          rel={isExternalSource ? "noreferrer" : undefined}
        >
          <span>
            <strong>{accessLabel}</strong>
            <small>{message}</small>
          </span>
          <span className="summary-action">{sourceUrl ? "Otevřít zdrojový článek" : "Přejít na celý článek"}</span>
        </a>
        <div className="access-disclosure-body">
          <p>
            Tento článek je otevřený bez přihlášení. Patří do úrovně <strong>{audienceLabel}</strong>, takže je určený
            pro veřejné návštěvníky, studenty a čtenáře, kteří se chtějí bezpečně zorientovat v tématu.
          </p>
          <p>
            Kliknutím na horní řádek otevřete zdroj monitoringu:{" "}
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                {source}
              </a>
            ) : (
              <a href={`#${articleTargetId}`}>celý text v MedScopeGlobal</a>
            )}
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="access-disclosure">
      <div className="access-disclosure-trigger">
        <span>
          <strong>{accessLabel}</strong>
          <small>{message}</small>
        </span>
      </div>
      <div className="access-disclosure-body">
        <p>{message}</p>
        <p>
          Uložení role a newsletteru pomůže zobrazit obsah podle profesního segmentu. Institucionální přístup je
          dostupný pro nemocnice, univerzity a výzkumné organizace.
        </p>
        <div className="actions">
          <Link className="button primary" href="/dashboard">
            Uložit roli a newsletter
          </Link>
          <Link className="button" href="/articles?audience=laik-student">
            Zobrazit veřejné a studentské články
          </Link>
        </div>
      </div>
    </section>
  );
}
