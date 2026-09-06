import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getLegalEntity, isLegalEntityComplete } from "@/lib/config/legal-entity";
import { getLegalChromeCopy } from "@/lib/i18n/legal-chrome-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.brandTitle,
    description: copy.brandDescription,
    path: "/znacka",
    locale,
  });
}

export default async function BrandLegalPage() {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  const entity = getLegalEntity();
  const complete = isLegalEntityComplete(entity);
  const mailHref = (email: string) => "mailto:" + email;
  const telHref = (phone: string) => "tel:" + phone.replace(/\s/g, "");

  return (
    <LegalPageLayout
      locale={locale}
      title={copy.brandTitle}
      description={copy.brandLead}
    >
      {copy.officialNote ? <p><em>{copy.officialNote}</em></p> : null}
      <h2>1. Provozovatel a označení</h2>
      <p>
        Platformu na doméně <strong>{entity.domain}</strong> provozuje{" "}
        <strong>{entity.name}</strong>
        {entity.ico ? (
          <>
            {" "}
            (IČO {entity.ico}
            {entity.dic ? ", DIČ " + entity.dic : ""})
          </>
        ) : null}
        {entity.courtFile ? <>, sp. zn. {entity.courtFile}</> : null}
        {entity.address ? <>. Sídlo: {entity.address}.</> : "."}
      </p>
      <p>
        Obchodní označení pro zákazníky: <strong>{entity.tradeName}</strong>. Primární
        slovní označení značky je <strong>{entity.brandWordmark}</strong>. Související
        označení: {entity.brandAliases.join(", ")}.
      </p>
      <p>
        Zákaznická podpora:{" "}
        <a href={mailHref(entity.supportEmail)}>{entity.supportEmail}</a>
        {entity.supportPhone ? (
          <>
            {" "}
            · <a href={telHref(entity.supportPhone)}>{entity.supportPhone}</a>
          </>
        ) : null}
        .
      </p>
      {!complete && (
        <p>
          <em>
            
            Úplná identifikace provozovatele musí být doplněna v LEGAL_ENTITY_*.
          </em>
        </p>
      )}

      <h2>2. Nezávislost na Medscape, WebMD a podobných značkách</h2>
      <p>
        <strong>MedScopeGlobal není spřízněn, licencován ani provozován</strong> společnostmi
        WebMD, LLC, Medscape, jejich mateřskými či sesterskými subjekty ani žádným jiným
        zahraničním medicínským portálem se podobným názvem. Nejde o oficiální českou ani
        evropskou mutaci Medscape.
      </p>
      <p>
        Jakákoli podobnost obecných medicínských slovních kořenů („med“, „scope“) je náhodná z
        hlediska lingvistické motivace značky a <strong>neznamená afiliaci</strong>. Uživatelé a
        obchodní partneři nesmí MedScopeGlobal prezentovat jako Medscape, WebMD ani jako jejich
        licenci.
      </p>

      <h2>3. Doména a užívání značky</h2>
      <p>
        Doména <strong>medscopeglobal.com</strong> je provozována výhradně pro tuto platformu.
        Neoprávněné používání označení MedScopeGlobal, matoucích domén, meta tagů, reklamních
        klíčových slov nebo vizuální imitace UI za účelem vyvolání záměny se zakazuje.
      </p>
      <p>
        Doménová registrace sama o sobě nenahrazuje zápis ochranné známky. Provozovatel uplatňuje
        práva z:
      </p>
      <ul>
        <li>užívání nezapsané značky a dobrého jména (české právo nekalé soutěže),</li>
        <li>autorského práva k obsahu a designu platformy,</li>
        <li>
          připravovaných / probíhajících přihlášek ochranných známek u ÚPV ČR a EUIPO (EUTM),
          jakmile jsou podány.
        </li>
      </ul>

      <h2>4. Autorská práva a obsah</h2>
      <p>
        Texty, struktura webu, databázové výběry, redakční shrnutí, grafika a software rozhraní
        jsou chráněny autorským zákonem (zákon č. 121/2000 Sb.) a případně databázovými právy.
        Shrnutí zahraničních zdrojů jsou původní redakční díla MedScopeGlobal; primární zdroje se
        citují. Není dovoleno hromadné stahování, scrapování ani komerční republishing bez
        písemného souhlasu.
      </p>

      <h2>5. Vymáhání</h2>
      <p>
        Porušení práv k označení nebo obsahu lze řešit zejména: výzvou k upuštění od jednání,
        návrhem na předběžné opatření, žalobou na nekalou soutěž / ochranu označení, oznámením
        zneužití domény (UDRP / ADR dle TLD) a návrhem na výmaz nebo námitkami v řízení o
        ochranné známce.
      </p>
      <p>
        Právní kontakt:{" "}
        <a href={mailHref(entity.legalEmail)}>{entity.legalEmail}</a>. Obecné dotazy:{" "}
        <a href={mailHref(entity.supportEmail)}>{entity.supportEmail}</a>.
      </p>

      <h2>6. Související dokumenty</h2>
      <ul>
        <li>
          <Link href="/terms">Obchodní podmínky</Link>
        </li>
        <li>
          <Link href="/privacy">Ochrana soukromí (GDPR)</Link>
        </li>
        <li>
          <Link href="/cookies">Cookies</Link>
        </li>
        <li>
          <Link href="/o-nas">O nás</Link>
        </li>
        <li>
          <Link href="/kontakt">Kontakt</Link>
        </li>
      </ul>
    </LegalPageLayout>
  );
}
