import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getLegalEntity } from "@/lib/config/legal-entity";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedPageMetadata({
  title: "Právní checklist a brief pro IP advokáta",
  description:
    "Akční checklist ochrany značky MedScopeGlobal — imprint, ochranná známka ÚPV/EUIPO, monitoring.",
  path: "/pravni-checklist",
});
}

export default function PravniChecklistPage() {
  const entity = getLegalEntity();

  return (
    <LegalPageLayout
      title="Právní checklist"
      description="Co je hotové na webu a co zbývá u advokáta / registrátora."
    >
      <h2>1. Hotovo na medscopeglobal.com</h2>
      <ul>
        <li>
          Identita provozovatele: {entity.name}, IČO {entity.ico}, sídlo {entity.address}
        </li>
        <li>
          Podpora: {entity.supportEmail}
          {entity.supportPhone ? ", " + entity.supportPhone : ""}
        </li>
        <li>
          Stránka značky a distancing od Medscape/WebMD: <Link href="/znacka">/znacka</Link>
        </li>
        <li>
          GDPR / podmínky: <Link href="/privacy">/privacy</Link>,{" "}
          <Link href="/terms">/terms</Link>
        </li>
        <li>Faktury: správná firma + režim neplátce DPH</li>
      </ul>

      <h2>2. Brief pro IP advokáta (P0)</h2>
      <p>Objednejte rešerši a přihlášku s těmito údaji:</p>
      <ul>
        <li>
          <strong>Přihlašovatel:</strong> {entity.name}, IČO {entity.ico}
          {entity.courtFile ? ", sp. zn. " + entity.courtFile : ""}
        </li>
        <li>
          <strong>Sídlo:</strong> {entity.address}
        </li>
        <li>
          <strong>Označení:</strong> slovní MedScopeGlobal (+ případně logo)
        </li>
        <li>
          <strong>Doména / užívání:</strong> https://{entity.domain}
        </li>
        <li>
          <strong>Úřady:</strong> ÚPV ČR (národní) + EUIPO (EUTM)
        </li>
        <li>
          <strong>Třídy Nice:</strong> 9, 35, 38, 41, 42; třída 44 jen po konzultaci
        </li>
        <li>
          <strong>Riziko:</strong> podobnost s Medscape / WebMD a dalšími MedScope označeními
        </li>
        <li>
          <strong>Watch:</strong> monitoring nových přihlášek a podobných domén
        </li>
      </ul>

      <h2>3. Provozní kroky (P1)</h2>
      <ul>
        <li>Registrar lock + 2FA u domény medscopeglobal.com</li>
        <li>V marketingu vždy plný wordmark MedScopeGlobal</li>
        <li>Evidence prvního užívání (screenshoty, faktury, tisk)</li>
        <li>Smlouvy s autory/partnery: licence IP + NDA</li>
      </ul>

      <h2>4. Co web nemůže zajistit</h2>
      <p>
        Doména a právní texty nesuplují zápis ochranné známky a negarantují, že Medscape/WebMD
        nepodají námitku. Cíl je silný titul a dobrá důkazní pozice.
      </p>

      <p>
        Kontakt: <a href={"mailto:" + entity.legalEmail}>{entity.legalEmail}</a>
      </p>
    </LegalPageLayout>
  );
}
