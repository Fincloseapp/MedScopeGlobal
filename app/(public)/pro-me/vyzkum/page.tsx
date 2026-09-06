import type { Metadata } from "next";
import { ProMeAudiencePage, proMeAudienceMetadata } from "@/components/pro-me/pro-me-audience-page";

export async function generateMetadata(): Promise<Metadata> {
  return proMeAudienceMetadata("vyzkum");
}

export default async function ProMeVyzkumPage() {
  return <ProMeAudiencePage audience="vyzkum" />;
}
