import { ArticleConversionGate } from "@/components/v38/article-conversion-gate";
import type { StoredNudge } from "@/lib/v38/conversion-engine";
import { getStaticCopy } from "@/lib/v38/conversion-copy";

export function ArticleBody({
  html,
  locked,
  title,
  gateCopy,
}: {
  html: string;
  locked: boolean;
  title?: string;
  gateCopy?: StoredNudge;
}) {
  if (locked) {
    const copy = gateCopy ?? { ...getStaticCopy("article_gate"), generatedBy: "static" as const };
    return <ArticleConversionGate copy={copy} teaserHtml={html} title={title} />;
  }

  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
