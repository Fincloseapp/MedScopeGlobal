import Link from "next/link";
import type { ComponentProps } from "react";
import { studentPublicHref } from "@/lib/studenti/href";

/** Locale-prefixed Link so room clicks stay on /cs/… and skip the unprefixed 302. */
export function StudentLink({
  href,
  locale = "cs",
  ...rest
}: ComponentProps<typeof Link> & { locale?: string }) {
  const next = typeof href === "string" ? studentPublicHref(href, locale) : href;
  return <Link href={next} {...rest} />;
}
