import {
  listingByline,
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

  const primary = listingByline(article, locale);

  if (variant === "compact") {
    return <span className={className}>{primary}</span>;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="font-medium text-foreground">{primary}</p>
    </div>
  );
}
