import { FirmyDesk } from "@/components/firmy/firmy-desk";
import { getFirmyDeskCopy } from "@/lib/i18n/firmy-desk-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata() {
  const locale = await getServerLocale();
  const desk = getFirmyDeskCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: `${desk.metaTitle} | MedScopeGlobal`,
    description: desk.metaDescription,
    path: "/firmy",
    locale,
  });
}

export default async function FirmyHubPage() {
  return <FirmyDesk />;
}
