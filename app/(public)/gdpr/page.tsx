import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Ochrana osobních údajů (GDPR)",
  description:
    "Zpracování osobních údajů, cookies, analytika, newsletter a AI zpracování dat na MedScopeGlobal.",
  path: "/gdpr",
});

export default function GdprPage() {
  return (
    <LegalPageLayout
      title="Ochrana osobních údajů (GDPR)"
      description="Informace o zpracování osobních údajů dle nařízení EU 2016/679."
    >
      <h2>1. Správce údajů</h2>
      <p>
        Správcem osobních údajů je provozovatel MedScopeGlobal. Kontakt:{" "}
        <a href="mailto:support@medscopeglobal.com">support@medscopeglobal.com</a>.
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
        nasazujeme pouze s vaším souhlasem. Preference můžete spravovat na stránce{" "}
        <a href="/cookies">Cookies</a>.
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
