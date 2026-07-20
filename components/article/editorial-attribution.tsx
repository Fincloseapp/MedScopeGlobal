import {
  assignEditorialUnits,
  editorialUnitLabel,
  formatEditorialUnitDisplay,
  isEditorialUnitId,
  type ArticleForEditorialUnits,
  type EditorialLocale,
} from "@/lib/editorial/units";

type Props = {
  article: ArticleForEditorialUnits;
  locale?: EditorialLocale;
  variant?: "header" | "compact";
  className?: string;
};

export function EditorialAttribution({
  article,
  locale = "cs",
  variant = "header",
  className = "",
}: Props) {
  if (!article) return null;

  const assignment = assignEditorialUnits(article);
  // Public bylines stay clean; AI disclosure lives in EditorialFooter.
  const primary = formatEditorialUnitDisplay(assignment.primary, locale, false);
  const reviewer =
    assignment.reviewer && isEditorialUnitId(assignment.reviewer)
      ? editorialUnitLabel(assignment.reviewer, locale)
      : null;

  if (variant === "compact") {
    return (
      <span className={className}>
        {primary}
        {reviewer ? ` · ${locale === "cs" ? "Recenzováno:" : "Reviewed by:"} ${reviewer}` : null}
      </span>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="font-medium text-foreground">{primary}</p>
      {reviewer ? (
        <p className="text-xs text-muted-foreground">
          {locale === "cs" ? "Odborná recenze:" : "Editorial review:"}{" "}
          {reviewer}
        </p>
      ) : null}
    </div>
  );
}
