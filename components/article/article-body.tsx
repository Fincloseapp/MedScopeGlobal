import { ArticleConversionGate } from "@/components/v38/article-conversion-gate";
import type { StoredNudge } from "@/lib/v38/conversion-engine";
import { getStaticCopy } from "@/lib/v38/conversion-copy";
import { getPaywallPreviewHtml } from "@/lib/vip";

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
    const previewHtml = getPaywallPreviewHtml(html);
    return (
      <>
        {previewHtml ? (
          <div className="relative">
            <div
              className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-background"
              aria-hidden
            />
          </div>
        ) : null}
        <div className={previewHtml ? "mt-6" : undefined}>
          <ArticleConversionGate copy={copy} title={title} />
        </div>
      </>
    );
  }

  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
