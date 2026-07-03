import {
  assignEditorialUnits,
  editorialUnitLabel,
  formatEditorialUnitDisplay,
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
  const assignment = assignEditorialUnits(article);
  const primary = formatEditorialUnitDisplay(assignment.primary, locale, assignment.aiAssisted);
  const reviewer = assignment.reviewer
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
