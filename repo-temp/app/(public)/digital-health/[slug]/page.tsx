import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { V22DigitalHealthDetail } from "@/components/v22/digital-health-detail";
import { getV22DigitalHealthArticle } from "@/lib/v22/digital-health/query";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getV22DigitalHealthArticle(slug);
  return {
    title: article?.title ?? "Digitální zdravotnictví",
    description: article?.summaryCs,
  };
}

export const revalidate = 120;

export default async function DigitalHealthDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getV22DigitalHealthArticle(slug);
  if (!article) notFound();
  return <V22DigitalHealthDetail article={article} />;
}
