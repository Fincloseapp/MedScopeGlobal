import type { Metadata } from "next";
import ContactPage from "../contact/page";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedPageMetadata({
  title: "Kontakt",
  description:
    "Kontaktujte MedScopeGlobal pro odborné informace, partnerství nebo reklamní spolupráci.",
  path: "/kontakt",
});
}

export default ContactPage;
