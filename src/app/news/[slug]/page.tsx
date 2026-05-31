import { redirect } from "next/navigation";
import { MedicalSectionPage } from "@/components/medical-section-page";
import { getMedicalSection } from "@/lib/medical-sections";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailAliasPage({ params }: PageProps) {
  const { slug } = await params;
  if (getMedicalSection(`/news/${slug}`)) return <MedicalSectionPage path={`/news/${slug}`} />;
  redirect(`/articles/${slug}`);
}
