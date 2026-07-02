import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { SITE } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "O MedScopeGlobal",
  description:
    "MedScopeGlobal je český odborný medicínský portál pro laiky, studenty medicíny, lékaře a výzkumníky.",
  path: "/about",
});

export default function AboutPage() {
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

      <div className="prose prose-slate max-w-none">
        <h2>Naše mise</h2>
        <p>
          MedScopeGlobal propojuje klinickou praxi, vědecký výzkum a vzdělávání v medicíně.
          Kurátorský obsah, citace zdrojů a odborné rubriky pomáhají lékařům, studentům i
          veřejnosti orientovat se v rychle se měnící medicíně.
        </p>

        <h2>Pro koho jsme tu</h2>
        <ul>
          <li>Veřejnost — srozumitelné zdravotní informace a prevence</li>
          <li>Studenti medicíny — studijní materiály, přijímačky a fakulty</li>
          <li>Lékaři a odborníci — klinické briefy, studie a odborné sekce</li>
          <li>Výzkumníci — přehled studií a publikací</li>
        </ul>

        <h2>Kvalita a bezpečnost</h2>
        <p>
          Obsah prochází redakční kontrolou. AI nástroje jsou auditovány a nepředstavují
          náhradu odborné zdravotní péče. V akutních případech volejte linku 155 nebo 112.
        </p>
      </div>
    </ModulePageShell>
  );
}
