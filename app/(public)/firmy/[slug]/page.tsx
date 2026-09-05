import { notFound } from "next/navigation";
import { FirmyDesk } from "@/components/firmy/firmy-desk";
import { FIRMY_ROOM_SLUGS, getFirmyDeskCopy, isFirmyRoomId } from "@/lib/i18n/firmy-desk-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export function generateStaticParams() {
  return FIRMY_ROOM_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isFirmyRoomId(slug)) return {};
  const locale = await getServerLocale();
  const room = getFirmyDeskCopy(locale).rooms[slug];
  return await buildLocalizedV20PageMetadata({
    title: `${room.metaTitle} | MedScopeGlobal`,
    description: room.metaDescription,
    path: `/firmy/${slug}`,
    locale,
  });
}

export default async function FirmySubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isFirmyRoomId(slug)) notFound();
  return <FirmyDesk slug={slug} />;
}
