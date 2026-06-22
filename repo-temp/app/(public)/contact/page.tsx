import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { PublicTrustBadges } from "@/components/verejnost/public-trust-badges";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { SITE } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Kontakt | MedScopeGlobal",
  description: "Kontaktujte MedScopeGlobal pro odborné informace, partnerství nebo reklamní spolupráci.",
  path: "/contact",
});

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "info@medscopeglobal.com",
      contactType: "customer service",
    },
    {
      "@type": "ContactPoint",
      email: "ads@medscopeglobal.com",
      contactType: "sales",
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="bg-[#fafcff]">
        <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.12),transparent_30%),linear-gradient(180deg,#fff_0%,#f8fbff_45%,#f6fbff_100%)]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">Kontakt</p>
                <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33] sm:text-5xl">
                  Napište nám — odpovíme do 24 hodin
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Dotazy k obsahu pro veřejnost, partnerství s univerzitami, reklamní spolupráce i technická podpora.
                  Každá zpráva je evidována a směrována správnému týmu.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a href="mailto:info@medscopeglobal.com" className="rounded-2xl border border-[#cfe1f3] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.65)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Hlavní kontakt</p>
                    <p className="mt-2 text-sm font-semibold text-[#021d33]">info@medscopeglobal.com</p>
                  </a>
                  <a href="mailto:ads@medscopeglobal.com" className="rounded-2xl border border-[#cfe1f3] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.65)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">Reklamy & inzerce</p>
                    <p className="mt-2 text-sm font-semibold text-[#021d33]">ads@medscopeglobal.com</p>
                  </a>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/submit-research" className="inline-flex items-center gap-2 rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white">
                    Odeslat výzkum
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/pricing" className="inline-flex rounded-full border border-[#8dc4ea] px-4 py-2 text-sm font-semibold text-[#005B96]">
                    Zobrazit ceník
                  </Link>
                </div>
              </div>

              <div className="rounded-[30px] border border-[#dfeaf5] bg-white p-5 shadow-[0_26px_70px_-34px_rgba(0,91,150,0.68)]">
                <div className="rounded-3xl bg-[#0A3D5C] p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#bfe3ff]">Odpověď do 24 hodin</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">Prioritizovaný kontakt</h2>
                  <p className="mt-2 text-sm text-white/80">
                    Zprávy z kontaktního formuláře jsou směrovány podle typu žádosti a každý dotaz je evidován do interního logu.
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-[#dbeaf7] bg-[#f8fbff] p-4">
                    <Mail className="mt-0.5 h-5 w-5 text-[#005B96]" />
                    <div>
                      <p className="text-sm font-semibold text-[#021d33]">Hlavní kontakty</p>
                      <p className="mt-1 text-sm text-muted-foreground">info@medscopeglobal.com pro odborné dotazy, publikace a spolupráce.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-[#dbeaf7] bg-[#f8fbff] p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-[#005B96]" />
                    <div>
                      <p className="text-sm font-semibold text-[#021d33]">Bezpečné zpracování</p>
                      <p className="mt-1 text-sm text-muted-foreground">Formuláře mají validaci, anti-spam ochranu a auditní logování.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
              Důvěra a bezpečnost
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#021d33]">
              Proč nám můžete napsat
            </h2>
            <div className="mt-5">
              <PublicTrustBadges />
            </div>
            <div className="mt-6">
              <PublicTrustDisclaimer />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Zásady ochrany údajů:{" "}
              <Link href="/privacy" className="font-medium text-[#005B96] hover:underline">
                Ochrana soukromí (GDPR)
              </Link>
              {" · "}
              <Link href="/o-nas" className="font-medium text-[#005B96] hover:underline">
                O nás
              </Link>
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ContactForm
              kind="general"
              title="Obecný dotaz"
              description="Napište nám, pokud potřebujete informace o obsahu, spolupráci nebo publikaci."
              destination="info@medscopeglobal.com"
            />
            <ContactForm
              kind="partner"
              title="Partnerský kontakt"
              description="Pro reklamní spolupráci, inzerci nebo komerční partnerství využijte tento formulář."
              destination="ads@medscopeglobal.com"
            />
          </div>
        </section>
      </div>
    </>
  );
}
