import type { Metadata } from "next";
import {
  SectionDetailPage,
  generateSectionDetailMetadata,
} from "@/lib/pages/section-detail-page";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateSectionDetailMetadata({ params, basePath: "/sections" });
}

export default async function SectionsSlugPage(props: Props) {
  return SectionDetailPage({ ...props, basePath: "/sections" });
}
