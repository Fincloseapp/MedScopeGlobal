import { MedicalSectionPage } from "@/components/medical-section-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProfessionalSectionRoute({ params }: PageProps) {
  const { slug } = await params;
  return <MedicalSectionPage path={`/professional/${slug}`} />;
}
