import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site";
export const metadata: Metadata = { title: "Kontakt", description: "Kontaktujte MedScopeGlobal pro obecné dotazy, reklamu nebo partnerství." };
export default function ContactPage() { return <main className="section"><p className="eyebrow">Kontakt</p><h1>Ozvěte se týmu MedScopeGlobal.</h1><p className="lead">Hlavní kontakt: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>. Reklamy a inzerce: <a href={`mailto:${siteConfig.adsEmail}`}>{siteConfig.adsEmail}</a>.</p><div className="grid two"><ContactForm endpoint="/api/contact/general" title="Hlavní kontakt" defaultTopic="Obecný dotaz" leadSource="contact_general" /><ContactForm endpoint="/api/contact/partner" title="Reklamy a partnerství" defaultTopic="B2B spolupráce" leadSource="contact_partner" /></div></main>; }
