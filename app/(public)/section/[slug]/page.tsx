import type { Metadata } from "next";
import {
  SectionDetailPage,
  generateSectionDetailMetadata,
  sectionDetailRevalidate,
} from "@/lib/pages/section-detail-page";

export const revalidate = sectionDetailRevalidate;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateSectionDetailMetadata({ params, basePath: "/section" });
}

export default function SectionSlugPage(props: Props) {
  return SectionDetailPage({ ...props, basePath: "/section" });
}
