import type { Metadata } from "next";
import { ProMeAudiencePage, proMeAudienceMetadata } from "@/components/pro-me/pro-me-audience-page";

export async function generateMetadata(): Promise<Metadata> {
  return proMeAudienceMetadata("lekari");
}

export default async function ProMeLekariPage() {
  return <ProMeAudiencePage audience="lekari" />;
}
