import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { SITE } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "O nás | MedScopeGlobal",
  description:
    "MedScopeGlobal je český odborný medicínský portál pro laiky, studenty medicíny, lékaře a výzkumníky.",
  path: "/o-nas",
});

const AUDIENCE_LINKS = [
  { href: "/pro-koho/laik-student", label: "Veřejnost a studenti", desc: "Prevence, příprava na LF a srozumitelné výklady" },
  { href: "/pro-koho/lekar", label: "Lékaři", desc: "Guidelines, studie a klinické briefy" },
  { href: "/pro-koho/vedec", label: "Výzkum", desc: "Přehled studií a evidence-based obsah" },
  { href: "/studie", label: "Studie", desc: "Archiv vědeckých publikací" },
];

export default function ONasPage() {
  return (
    <ModulePageShell
      eyebrow="O nás"
      title="MedScopeGlobal — odborný medicínský portál pro ČR"
      description={SITE.description}
      ctaHref="/kontakt"
      ctaLabel="Kontaktujte nás"
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>O nás</span>
      </nav>

      <PublicTrustDisclaimer className="mb-8" />

      <div className="prose prose-slate max-w-none">
        <h2>Naše mise</h2>
        <p>
          MedScopeGlobal propojuje klinickou praxi, vědecký výzkum a vzdělávání v medicíně.
          Kurátorský obsah, citace zdrojů a odborné rubriky pomáhají lékařům, studentům i
          veřejnosti orientovat se v rychle se měnící medicíně.
        </p>

        <h2>Pro koho jsme tu</h2>
        <p>Vyberte sekci podle toho, kdo jste — každá cesta má vlastní obsah a nástroje.</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {AUDIENCE_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40 hover:shadow-sm"
          >
            <p className="font-semibold text-[#021d33]">{item.label}</p>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="prose prose-slate mt-10 max-w-none">
        <h2>Kvalita a bezpečnost</h2>
        <p>
          Obsah prochází redakční kontrolou. AI nástroje jsou auditovány a nepředstavují
          náhradu odborné zdravotní péče. V akutních případech volejte linku 155 nebo 112.
        </p>

        <h2>Kontakt a spolupráce</h2>
        <p>
          Máte dotaz k obsahu, chcete navázat partnerství nebo inzerci? Navštivte stránku{" "}
          <Link href="/kontakt">Kontakt</Link> — odpovídáme obvykle do 24 hodin.
        </p>
      </div>
    </ModulePageShell>
  );
}
