import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getLegalEntity } from "@/lib/config/legal-entity";
import { SALES_PACKAGES, formatSalesCzk, salesYearlyCzk } from "@/lib/sales/packages";

export const metadata: Metadata = {
  title: "Podmínky inzerce",
  description: "Smluvní a zákonné podmínky měsíční inzerce na MedScopeGlobal.",
};

export default async function InzercePodminkyPage({
  searchParams,
}: {
  searchParams: Promise<{ unsubscribed?: string }>;
}) {
  const entity = getLegalEntity();
  const query = await searchParams;
  return (
    <LegalPageLayout
      title="Podmínky inzerce MedScopeGlobal"
      description="Obchodní, daňové a reklamní podmínky paušální inzerce. Platí vedle obecných podmínek webu."
    >
      {query.unsubscribed === "1" ? (
        <p>
          <strong>Obchodní nabídky byly odhlášeny.</strong> Vaše adresa je v seznamu zákazů odesílání.
        </p>
      ) : null}

      <h2>1. Provozovatel</h2>
      <p>
        Inzerci na medscopeglobal.com prodává {entity.name}
        {entity.ico ? `, IČO ${entity.ico}` : ""}
        {entity.address ? `, ${entity.address}` : ""}. Kontakt: {entity.supportEmail}
        {entity.supportPhone ? `, ${entity.supportPhone}` : ""}. Režim DPH:{" "}
        {entity.dic ? `plátce, DIČ ${entity.dic}` : "neplátce DPH dle ARES"}.
      </p>

      <h2>2. Předmět</h2>
      <p>
        Paušál je měsíční služba umístění označené inzerce a předání poptávek podle zvoleného tarifu.
        Není to lékařská rada, není to skrytá reklama a není to affiliate provize z obchodu čtenáře.
      </p>
      <ul>
        {SALES_PACKAGES.map((pkg) => (
          <li key={pkg.id}>
            {pkg.name} — {formatSalesCzk(pkg.priceCzkMonth)} / měsíc, nebo {formatSalesCzk(salesYearlyCzk(pkg.priceCzkMonth))} / rok (2 měsíce zdarma)
          </li>
        ))}
      </ul>

      <h2>3. Objednávka, smlouva, obnova</h2>
      <p>
        Objednávka na <Link href="/inzerce/pausal">/inzerce/pausal</Link> je nabídka k uzavření smlouvy o
        poskytování reklamní služby. Smlouva vzniká úhradou první faktury nebo aktivací Stripe předplatného.
        Paušál se obnovuje na další období (měsíc nebo rok), dokud jej inzerent neskončí e-mailem na {entity.supportEmail}{" "}
        nejméně 14 dní před koncem období, nebo zrušením Stripe předplatného.
      </p>

      <h2>4. Platba a faktura</h2>
      <p>
        Po objednávce vystavíme daňový doklad (fakturu) s variabilním symbolem a zašleme jej na e-mail
        objednatele. Stripe karta strhne paušál automaticky. Převod: splatnost 14 dní. Neuhrazený paušál
        po 3 dnech od splatnosti pozastavíme (plochy i předání poptávek). Po úhradě obnovíme plnění.
      </p>

      <h2>5. Plnění</h2>
      <p>
        Zaplacený tarif určuje plochy, newsletter, adresář /partneri a SLA předání poptávek. Poptávka
        čtenáře se inzerentovi předá jen při aktivním paušálu. Kreativu smí provozovatel odmítnout
        (právní, bezpečnostní a diplomatická redakce).
      </p>

      <h2>6. Reklamní a zdravotnické právo</h2>
      <p>
        Inzerce se označuje. Zakázána jsou klamavá zdravotní tvrzení, zázračné léčby a reklama na
        léčivé přípravky vázané na recept vůči veřejnosti (zákon č. 40/1995 Sb., zákon č. 378/2007 Sb.,
        dozor SÚKL). Rx kampaně jen na odborné ploše po schválení.
      </p>

      <h2>7. Osobní údaje a obchodní sdělení</h2>
      <p>
        Správce: {entity.name}. Účely: plnění smlouvy, fakturace, předání poptávek, evidence zákonných
        povinností. B2B nabídky opíráme o oprávněný zájem nebo o poptávku inzerenta. Osobní mailboxy
        (Seznam, Gmail) bez souhlasu neoslovujeme. Odhlášení je v každém nabídkovém e-mailu. Více:{" "}
        <Link href="/privacy">/privacy</Link>.
      </p>

      <h2>8. Odpovědnost</h2>
      <p>
        Inzerent ručí za pravdivost inzerátu a za soulad s právem. Provozovatel neručí za uzavření
        obchodu mezi čtenářem a inzerentem. Škoda z výpadku webu je omezena na poměrnou část paušálu
        za dobu výpadku delší než 24 hodin.
      </p>

      <h2>9. Rozhodné právo</h2>
      <p>České právo, soudy ČR. Obecné podmínky webu: <Link href="/terms">/terms</Link>.</p>
    </LegalPageLayout>
  );
}
