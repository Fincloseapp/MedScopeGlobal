import type { Metadata } from "next";
import {
  AiMedicalDeskPage,
  generateAiMedicalDeskMetadata,
} from "@/components/ai-medical/ai-medical-desk-page";

export async function generateMetadata(): Promise<Metadata> {
  return generateAiMedicalDeskMetadata("univerzity");
}

export default function AiMedicalUniverzityPage() {
  return <AiMedicalDeskPage assistant="univerzity" />;
}
