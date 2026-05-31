"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArticleFullBody } from "@/components/article-body-expander";

interface ArticleAccessDisclosureProps {
  accessLabel: string;
  audienceLabel: string;
  message: string;
  hasFullAccess: boolean;
  requiresSubscription: boolean;
  article?: {
    content: string;
    summary: string;
    specialization: string;
    source: string;
    sourceUrl?: string;
    tags: string[];
  };
}

export function ArticleAccessDisclosure({
  accessLabel,
  audienceLabel,
  message,
  hasFullAccess,
  requiresSubscription,
  article
}: ArticleAccessDisclosureProps) {
  const isPublicStudent = hasFullAccess && !requiresSubscription;
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <section className={isPublicStudent ? "access-disclosure success-disclosure" : "access-disclosure"}>
      <button
        className="access-disclosure-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span>
          <strong>{accessLabel}</strong>
          <small>{message}</small>
        </span>
        <span className="summary-action">{isOpen ? "Sbalit detail" : "Rozbalit detail"}</span>
      </button>
      {isOpen ? (
        <div className="access-disclosure-body" id={panelId}>
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
              {article ? (
                <div className="access-article-body">
                  <h3>Celý článek dostupný z této úrovně</h3>
                  <ArticleFullBody
                    content={article.content}
                    summary={article.summary}
                    specialization={article.specialization}
                    source={article.source}
                    sourceUrl={article.sourceUrl}
                    tags={article.tags}
                  />
                </div>
              ) : null}
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
      ) : null}
    </section>
  );
}
