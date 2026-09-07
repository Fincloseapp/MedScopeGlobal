import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";

export const metadata: Metadata = {
  title: "Právní checklist",
  robots: { index: false, follow: false },
};

/** Internal lawyer brief — not a consumer document. Lives under /admin. */
export default async function PravniChecklistPublicGonePage() {
  const locale = await getServerLocale();
  permanentRedirect(localizePublicHref("/kontakt", locale));
}
