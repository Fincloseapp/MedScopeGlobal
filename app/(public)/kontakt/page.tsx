import type { Metadata } from "next";
import ContactPage from "../contact/page";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { getServerLocale } = await import("@/lib/i18n/server-locale");
  const { getMarketingCopy } = await import("@/lib/i18n/marketing-copy");
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale).contact;
  return await buildLocalizedPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/kontakt",
    locale,
  });
}

export default ContactPage;
