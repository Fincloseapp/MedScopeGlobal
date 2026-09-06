import type { Metadata } from "next";
import {
  AiMedicalDeskPage,
  generateAiMedicalDeskMetadata,
} from "@/components/ai-medical/ai-medical-desk-page";

export async function generateMetadata(): Promise<Metadata> {
  return generateAiMedicalDeskMetadata("patient");
}

export default function AiMedicalPatientPage() {
  return <AiMedicalDeskPage assistant="patient" />;
}
