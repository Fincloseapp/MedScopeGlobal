import { notFound } from "next/navigation";
import { PhysicianRoomPage } from "@/components/lekari/physician-room-page";
import type { PhysicianRoomId } from "@/lib/i18n/physician-room-copy";
import { V271_LEKARI_PAGES, buildV271HubMetadata } from "@/lib/v271/routes";

export const revalidate = 120;

const SLUGS = Object.keys(V271_LEKARI_PAGES).filter((k) => k !== "index");

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = V271_LEKARI_PAGES[slug];
  if (!page) return {};
  return await buildV271HubMetadata("lekari", page);
}

export default async function LekariSubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = V271_LEKARI_PAGES[slug];
  if (!page) notFound();
  if (!isPhysicianRoom(slug)) notFound();
  return <PhysicianRoomPage page={page} slug={slug} />;
}

function isPhysicianRoom(slug: string): slug is PhysicianRoomId {
  return (
    slug === "guidelines" ||
    slug === "prehledy" ||
    slug === "studie" ||
    slug === "research-hub" ||
    slug === "ai-asistent"
  );
}
