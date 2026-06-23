export type SeoAuditInput = {
  url?: string;
  title?: string;
  content?: string;
};

export async function auditSeo(input: SeoAuditInput) {
  const title = input.title ?? "";
  const content = input.content ?? "";
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!title || title.length < 30) issues.push("Title too short (< 30 chars)");
  if (title.length > 60) issues.push("Title may truncate in SERP (> 60 chars)");
  if (!content || content.length < 300) issues.push("Thin content (< 300 chars)");
  if (!/<h2/i.test(content)) recommendations.push("Add H2 sections for structure");
  if (!input.url) recommendations.push("Set canonical URL");

  const score = Math.max(0, 100 - issues.length * 15);

  return {
    ok: true,
    score,
    issues,
    recommendations,
    provider: "v47-seo-engine",
    auditedAt: new Date().toISOString(),
  };
}
