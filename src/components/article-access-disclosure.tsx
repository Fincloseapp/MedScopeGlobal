import Link from "next/link";

interface ArticleAccessDisclosureProps {
  accessLabel: string;
  audienceLabel: string;
  message: string;
  hasFullAccess: boolean;
  requiresSubscription: boolean;
}

export function ArticleAccessDisclosure({
  accessLabel,
  audienceLabel,
  message,
  hasFullAccess,
  requiresSubscription
}: ArticleAccessDisclosureProps) {
  const isPublicStudent = hasFullAccess && !requiresSubscription;

  return (
    <details className={isPublicStudent ? "access-disclosure success-disclosure" : "access-disclosure"}>
      <summary>
        <span>
          <strong>{accessLabel}</strong>
          <small>{message}</small>
        </span>
        <span className="summary-action">Rozbalit detail</span>
      </summary>
      <div className="access-disclosure-body">
        {isPublicStudent ? (
          <>
            <p>
              Tento článek je otevřený bez přihlášení. Patří do úrovně <strong>{audienceLabel}</strong>, takže je
              určený pro veřejné návštěvníky, studenty a čtenáře, kteří se chtějí bezpečně zorientovat v tématu.
            </p>
            <p>
              Odborné a premium materiály mohou vyžadovat uloženou roli nebo institucionální přístup, ale tento text
              zůstává plně čitelný všem návštěvníkům.
            </p>
            <div className="actions">
              <Link className="button" href="/articles?audience=laik-student">
                Další veřejné a studentské články
              </Link>
              <Link className="button" href="/dashboard">
                Nastavit preference
              </Link>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </details>
  );
}
