import { notFound } from "next/navigation";
import { V271HubPageView } from "@/components/v271/hub-page";
import { V271_FIRMY_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

const SLUGS = Object.keys(V271_FIRMY_PAGES).filter((k) => k !== "index");

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = V271_FIRMY_PAGES[slug];
  if (!page) return {};
  return buildV271HubMetadata("firmy", page);
}

export default async function FirmySubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = V271_FIRMY_PAGES[slug];
  if (!page) notFound();
  return <V271HubPageView page={page} sectionLabel="Firmy" homeHref="/firmy" />;
}
