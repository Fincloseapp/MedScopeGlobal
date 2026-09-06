import type { Metadata } from "next";
import {
  AiMedicalDeskPage,
  generateAiMedicalDeskMetadata,
} from "@/components/ai-medical/ai-medical-desk-page";

export async function generateMetadata(): Promise<Metadata> {
  return generateAiMedicalDeskMetadata("studie");
}

export default function AiMedicalStudiePage() {
  return <AiMedicalDeskPage assistant="studie" />;
}
