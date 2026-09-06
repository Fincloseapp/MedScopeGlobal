import type { Metadata } from "next";
import { ProMeAudiencePage, proMeAudienceMetadata } from "@/components/pro-me/pro-me-audience-page";

export async function generateMetadata(): Promise<Metadata> {
  return proMeAudienceMetadata("pacienti");
}

export default async function ProMePacientiPage() {
  return <ProMeAudiencePage audience="pacienti" />;
}
