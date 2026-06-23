import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VerejnostArticleDetail } from "@/components/verejnost/verejnost-article-detail";
import {
  getPublicArticleBySlug,
  listPublicAdCampaigns,
  type PublicTopic,
} from "@/lib/queries/verejnost";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);
  return {
    title: article ? `${article.title} | Veřejné zdraví` : "Veřejné zdraví",
    description: article?.excerpt ?? undefined,
  };
}

export const revalidate = 120;

export default async function VerejnostClanekDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);
  if (!article) notFound();

  const topic = (article.public_topic ?? null) as PublicTopic | null;
  const campaigns = await listPublicAdCampaigns({ topic });

  const bannerAds = campaigns.filter((c) => c.type === "banner").slice(0, 1);
  const inlineAds = campaigns.filter((c) => c.type === "inline").slice(0, 1);
  const sidebarAds = campaigns.filter((c) => c.type === "sidebar").slice(0, 3);

  return (
    <VerejnostArticleDetail
      article={article}
      bannerAds={bannerAds}
      inlineAds={inlineAds}
      sidebarAds={sidebarAds}
    />
  );
}
