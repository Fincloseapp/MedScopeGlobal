import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { CookiePreferenceCenter } from "@/components/legal/cookie-banner";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getLegalChromeCopy } from "@/lib/i18n/legal-chrome-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.cookiesTitle,
    description: copy.cookiesDescription,
    path: "/cookies",
    locale,
  });
}

export default async function CookiesPage() {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  return (
    <LegalPageLayout
      locale={locale}
      title={copy.cookiesTitle}
      description={copy.cookiesLead}
    >
      {copy.officialNote ? <p><em>{copy.officialNote}</em></p> : null}
      <h2>Typy cookies</h2>
      <ul>
        <li>
          <strong>Nezbytné</strong> — přihlášení, bezpečnost, jazyk (vždy aktivní)
        </li>
        <li>
          <strong>Analytické</strong> — anonymní statistiky návštěvnosti
        </li>
        <li>
          <strong>Marketingové</strong> — Google AdSense (ca-pub-6820104998820692) na veřejném
          magazínu ViaLongeVita. Souhlas v EHP / UK / Švýcarsku řeší certifikovaná CMP od Googlu
          (Souhlasím / Nesouhlasím / Spravovat možnosti). Lékařské, studentské a admin plochy
          reklamy nenačítají.
        </li>
      </ul>

      <h2>Centrum preferencí</h2>
      <p>Níže můžete upravit své preference cookies:</p>

      <CookiePreferenceCenter />

      <h2>Doba uchování</h2>
      <p>
        Nezbytné cookies: do 12 měsíců. Analytické a marketingové: dle vašeho souhlasu, max.
        12 měsíců.
      </p>
    </LegalPageLayout>
  );
}
