import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";

export const metadata: Metadata = {
  title: "Předplatné",
  robots: { index: false, follow: true },
};

/** Legacy /pricing — live tariffs live on /predplatne. */
export default async function PricingAliasPage() {
  const locale = await getServerLocale();
  permanentRedirect(localizePublicHref("/predplatne", locale));
}
