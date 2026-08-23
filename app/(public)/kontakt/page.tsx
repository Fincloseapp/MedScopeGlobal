import type { Metadata } from "next";
import ContactPage from "../contact/page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Kontakt",
  description:
    "Kontaktujte MedScopeGlobal pro odborné informace, partnerství nebo reklamní spolupráci.",
  path: "/kontakt",
});

export default function KontaktPage({
  searchParams,
}: {
  searchParams?: Promise<{ predmet?: string; zprava?: string }>;
}) {
  return <ContactPage searchParams={searchParams} />;
}
