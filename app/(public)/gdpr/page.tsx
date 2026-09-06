import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getLegalEntity } from "@/lib/config/legal-entity";
import { getLegalChromeCopy } from "@/lib/i18n/legal-chrome-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.gdprTitle,
    description: copy.gdprDescription,
    path: "/gdpr",
    locale,
  });
}

export default async function GdprPage() {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  const entity = getLegalEntity();

  return (
    <LegalPageLayout
      locale={locale}
      title={copy.gdprTitle}
      description={copy.gdprLead}
    >
      {copy.officialNote ? <p><em>{copy.officialNote}</em></p> : null}
      <h2>1. Správce údajů</h2>
      <p>
        Správcem osobních údajů je <strong>{entity.name}</strong>
        {entity.ico ? <> (IČO {entity.ico})</> : null}
        {entity.address ? <>, sídlo: {entity.address}</> : null}. Kontakt:{" "}
        <a href={`mailto:${entity.legalEmail}`}>{entity.legalEmail}</a>. Úplné znění:{" "}
        <Link href={localizePublicHref("/privacy", locale)}>{copy.privacyTitle}</Link>.
      </p>

      <h2>2. Rozsah zpracování</h2>
      <p>Zpracováváme zejména:</p>
      <ul>
        <li>Identifikační údaje (jméno, e-mail)</li>
        <li>Údaje o profesi a ověření (pro úroveň Physician)</li>
        <li>Platební metadata (přes Stripe — neukládáme čísla karet)</li>
        <li>Technické logy (IP, cookies, bezpečnostní události)</li>
      </ul>

      <h2>3. Cookies a analytika</h2>
      <p>
        Používáme nezbytné cookies pro přihlášení a jazykové preference. Analytické cookies
        Preference můžete spravovat na stránce{" "}
        <Link href={localizePublicHref("/cookies", locale)}>{copy.cookiesTitle}</Link>.
      </p>

      <h2>4. Newsletter</h2>
      <p>
        Odběr newsletteru je dobrovolný. Odhlášení je možné odkazem v každém e-mailu nebo v
        nastavení účtu.
      </p>

      <h2>5. AI zpracování dat</h2>
      <p>
        Dotazy AI asistenta jsou logovány pro audit a bezpečnost (max. 20 dotazů/den/uživatel).
        Neukládáme plné prompty déle než 90 dní. AI klíče jsou výhradně server-side.
      </p>

      <h2>6. Práva subjektů údajů</h2>
      <p>Máte právo na:</p>
      <ul>
        <li>Přístup k údajům a jejich kopii</li>
        <li>Opravu nepřesných údajů</li>
        <li>Výmaz („právo být zapomenut“)</li>
        <li>Omezení zpracování a námitku</li>
        <li>Přenositelnost údajů</li>
        <li>Podání stížnosti u ÚOOÚ</li>
      </ul>
    </LegalPageLayout>
  );
}
