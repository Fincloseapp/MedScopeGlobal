import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Obchodní podmínky",
  description:
    "Obchodní podmínky MedScopeGlobal — předplatné, odpovědnost, záruky, reklamace a ukončení služby.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Obchodní podmínky"
      description="Platné pro všechny uživatele platformy MedScopeGlobal."
    >
      <h2>1. Úvodní ustanovení</h2>
      <p>
        Tyto obchodní podmínky upravují vztah mezi provozovatelem MedScopeGlobal a uživateli
        online platformy pro odborný medicínský obsah. Používáním služby souhlasíte s těmito
        podmínkami.
      </p>

      <h2>2. Předplatné a platby</h2>
      <p>
        Premium a VIP předplatné se účtuje měsíčně nebo ročně dle zvoleného tarifu. Platby
        zpracovává Stripe. Předplatné se automaticky obnovuje, pokud jej nezrušíte v sekci Účet
        nejpozději 24 hodin před koncem fakturačního období.
      </p>
      <ul>
        <li>Zkušební období: 7 dní (pokud je nabízeno)</li>
        <li>Měna: CZK</li>
        <li>Fakturace: elektronicky na registrovaný e-mail</li>
      </ul>

      <h2>3. Odpovědnost</h2>
      <p>
        Obsah MedScopeGlobal slouží výhradně ke vzdělávacím a informačním účelům. Nepředstavuje
        lékařskou radu, diagnózu ani léčbu. Provozovatel nenese odpovědnost za rozhodnutí
        učiněná na základě obsahu platformy.
      </p>

      <h2>4. Záruky</h2>
      <p>
        Službu poskytujeme v režimu „tak jak je“. Garantujeme dostupnost platformy s cílem
        99,5 % měsíční uptime, s výjimkou plánované údržby oznámené předem.
      </p>

      <h2>5. Reklamace</h2>
      <p>
        Reklamace předplatného nebo technických problémů zasílejte na{" "}
        <a href="mailto:support@medscopeglobal.com">support@medscopeglobal.com</a>. Vyřízení do
        14 pracovních dnů.
      </p>

      <h2>6. Ukončení služby</h2>
      <p>
        Uživatel může kdykoli ukončit účet v sekci Účet. Provozovatel si vyhrazuje právo
        pozastavit účet při porušení podmínek, zneužití AI služeb nebo bezpečnostních pravidel.
      </p>
    </LegalPageLayout>
  );
}
