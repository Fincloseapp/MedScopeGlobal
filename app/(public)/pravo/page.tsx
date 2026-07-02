import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Právní upozornění",
  description:
    "Právní upozornění, licenční podmínky a podmínky pro AI obsah MedScopeGlobal.",
  path: "/pravo",
});

export default function PravoPage() {
  return (
    <LegalPageLayout
      title="Právní upozornění"
      description="Licenční podmínky, disclaimer a pravidla pro AI generovaný obsah."
    >
      <h2>1. Medicínský disclaimer</h2>
      <p>
        MedScopeGlobal není náhradou odborné zdravotní péče. Veškerý obsah slouží ke vzdělávání
        a informování. V akutních případech volejte linku 155 nebo 112.
      </p>

      <h2>2. Licenční podmínky obsahu</h2>
      <p>
        Autorská práva k originálnímu obsahu náleží MedScopeGlobal nebo uvedeným autorům.
        Citace třetích stran jsou řádně označeny. Kopírování pro komerční účely bez souhlasu
        je zakázáno.
      </p>

      <h2>3. Podmínky pro AI obsah</h2>
      <p>
        Články generované nebo asistované AI procházejí redakční kontrolou. AI asistent na
        platformě:
      </p>
      <ul>
        <li>Neposkytuje diagnózy ani preskripce</li>
        <li>Je limitován na 20 dotazů denně na uživatele</li>
        <li>Podléhá detekci toxicity a spamu</li>
        <li>Je auditován v logu ai_agent_logs</li>
      </ul>

      <h2>4. Ochranné známky</h2>
      <p>
        MedScopeGlobal a související loga jsou ochrannými známkami provozovatele. Ostatní
        názvy patří jejich vlastníkům.
      </p>
    </LegalPageLayout>
  );
}
