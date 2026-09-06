import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getLegalChromeCopy } from "@/lib/i18n/legal-chrome-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.noticeTitle,
    description: copy.noticeDescription,
    path: "/pravo",
    locale,
  });
}

export default async function PravoPage() {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  return (
    <LegalPageLayout
      locale={locale}
      title={copy.noticeTitle}
      description={copy.noticeLead}
    >
      {copy.officialNote ? <p><em>{copy.officialNote}</em></p> : null}
      <h2>1. Medicínský disclaimer</h2>
      <p>
        MedScopeGlobal není náhradou odborné zdravotní péče. Veškerý obsah slouží ke vzdělávání
        a informování. V akutních případech volejte linku 155 nebo 112.
      </p>

      <h2>2. Licenční podmínky obsahu</h2>
      <p>
        Autorská práva k originálnímu obsahu, designu a kódu náleží provozovateli
        (Al Synaptica Research Institute s.r.o. / MedScopeGlobal) nebo uvedeným autorům.
        Citace třetích stran jsou řádně označeny.
      </p>
      <p>
        <strong>Povolení k užití, kopírování, scrapování nebo úpravám uděluje pouze
        provozovatel.</strong> Bez písemného souhlasu je zakázáno hromadné stahování,
        republishing i komerční přetisk. Běžné čtení webu, vyhledávače (Google, Seznam)
        a zobrazení reklam tím není omezeno.
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

      <h2>4. Ochranné známky a nezávislost značky</h2>
      <p>
        MedScopeGlobal a související označení (včetně MedScope Academy) jsou označeními
        provozovatele platformy na doméně medscopeglobal.com. Ostatní názvy patří jejich
        vlastníkům.
      </p>
      <p>
        <strong>MedScopeGlobal není spřízněn, licencován ani provozován</strong> společnostmi
        WebMD, LLC, Medscape ani jinými zahraničními medicínskými portály se podobným názvem.
        Nejde o oficiální mutaci Medscape. Podrobnosti:{" "}
        <Link href="/znacka">Značka a duševní vlastnictví</Link>. Související dokumenty:{" "}
        <Link href="/terms">Obchodní podmínky</Link>, <Link href="/privacy">Ochrana soukromí</Link>.
      </p>
    </LegalPageLayout>
  );
}
