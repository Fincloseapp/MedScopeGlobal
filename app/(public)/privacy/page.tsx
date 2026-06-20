import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Ochrana soukromí",
  description:
    "Zásady ochrany osobních údajů, cookies, analytika, newsletter a AI zpracování dat na MedScopeGlobal.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Ochrana soukromí"
      description="Informace o zpracování osobních údajů dle nařízení EU 2016/679 (GDPR)."
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
        spravujete na stránce{" "}
        <Link href="/cookies">Cookies</Link>.
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

      <h2 id="video-analytics">7. Video obsah a analytika sledování</h2>
      <p>
        Při sledování videí v Academy a veřejné osvětě můžeme zaznamenávat technické události
        přehrávání (play, pause, dokončení, chyba) pro měření dokončení kurzů a zlepšování
        platformy. Zpracování probíhá na základě oprávněného zájmu (čl. 6 odst. 1 písm. f GDPR)
        nebo plnění smlouvy u přihlášených uživatelů.
      </p>
      <ul>
        <li>
          <strong>Přihlášení uživatelé:</strong> události jsou propojeny s ID účtu (user_id) —
          viz sekce Cookies a analytika; lze vznést námitku v nastavení účtu.
        </li>
        <li>
          <strong>Anonymní / nepřihlášení:</strong> ukládáme pouze pseudonymní session_id v
          sessionStorage prohlížeče a typ události — bez jména, e-mailu ani IP v URL videa.
        </li>
        <li>
          <strong>URL videa:</strong> do logů ani analytiky neukládáme query parametry s osobními
          údaji; cesty k souborům obsahují pouze technické identifikátory.
        </li>
      </ul>
      <p>
        Videa se načítají z našeho úložiště (Supabase Storage CDN) nebo — při technické záloze —
        z veřejného CDN třetí strany (např. w3schools.com). Tyto domény mohou nastavovat vlastní
        cookies nebo logovat IP adresu dle svých zásad. Náš banner cookies (
        <Link href="/cookies">/cookies</Link>) umožňuje spravovat analytické cookies; nezbytné
        cookies pro přehrávání z našeho CDN zůstávají aktivní. Doporučujeme se seznámit se zásadami
        příslušného poskytovatele CDN při použití záložního zdroje.
      </p>
    </LegalPageLayout>
  );
}
