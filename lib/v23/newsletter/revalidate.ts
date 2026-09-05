import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/i18n/config";

/** Bust ISR for the web issue on every language prefix. */
export function revalidateNewsletterSurfaces(slug?: string | null) {
  const paths = [
    "/newsletter",
    "/newsletter/posledni",
    "/newsletter/archiv",
    "/",
    "/admin/newsletter",
  ];
  if (slug) paths.push(`/newsletter/${slug}`);
  for (const locale of LOCALES) {
    paths.push(`/${locale}/newsletter`);
    paths.push(`/${locale}/newsletter/posledni`);
    paths.push(`/${locale}/newsletter/archiv`);
    if (slug) paths.push(`/${locale}/newsletter/${slug}`);
  }
  for (const path of paths) {
    revalidatePath(path);
  }
}
