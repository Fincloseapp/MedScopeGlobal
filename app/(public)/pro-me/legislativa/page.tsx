import type { Metadata } from "next";
import { ProMeAudiencePage, proMeAudienceMetadata } from "@/components/pro-me/pro-me-audience-page";

export async function generateMetadata(): Promise<Metadata> {
  return proMeAudienceMetadata("legislativa");
}

export default async function ProMeLegislativaPage() {
  return <ProMeAudiencePage audience="legislativa" />;
}
