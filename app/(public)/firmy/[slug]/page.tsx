import { notFound } from "next/navigation";
import { V271HubPageView } from "@/components/v271/hub-page";
import { V271B2BPricingTable } from "@/components/v271/b2b-pricing-table";
import { getServerLocale } from "@/lib/i18n/server-locale";
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
  return await buildV271HubMetadata("firmy", page);
}

export default async function FirmySubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = V271_FIRMY_PAGES[slug];
  if (!page) notFound();
  const locale = await getServerLocale();

  return (
    <V271HubPageView
      page={page}
      section="firmy"
      afterLinks={slug === "cenik" ? <V271B2BPricingTable locale={locale} /> : undefined}
    />
  );
}
