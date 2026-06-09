import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { medicalWebPageJsonLd } from "@/lib/seo/json-ld";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { getNewsletterBySlug } from "@/lib/queries/v4c/newsletters";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getNewsletterBySlug(slug);
  if (!issue) {
    return buildV20PageMetadata({
      title: "Newsletter — MedScopeGlobal",
      description: "Odborný medicínský newsletter v češtině.",
      path: `/newsletter/${slug}`,
    });
  }

  const layout = issue.layout_json as V23NewsletterLayout | null;
  const description =
    layout?.intro?.slice(0, 160) ??
    "Týdenní odborný přehled studií, legislativy, léků a digitálního zdravotnictví v češtině.";

  return buildV20PageMetadata({
    title: issue.title,
    description,
    path: `/newsletter/${slug}`,
  });
}

export default async function NewsletterIssuePage({ params }: Props) {
  const { slug } = await params;
  const issue = await getNewsletterBySlug(slug);
  if (!issue) notFound();

  const layout = issue.layout_json as V23NewsletterLayout | null;

  const ld = medicalWebPageJsonLd({
    title: layout?.headline ?? issue.title,
    description: layout?.intro ?? "Odborný medicínský newsletter MedScopeGlobal",
    path: `/newsletter/${slug}`,
  });

  return (
    <ModulePageShell
      eyebrow="Newsletter"
      title={layout?.headline ?? issue.title}
      description="Odborný medicínský přehled MedScopeGlobal."
    >
      <JsonLdScript data={ld} />
      <V23NewsletterIssueView issue={issue} />
      <Link href="/newsletter/archiv" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        Archiv vydání →
      </Link>
    </ModulePageShell>
  );
}
