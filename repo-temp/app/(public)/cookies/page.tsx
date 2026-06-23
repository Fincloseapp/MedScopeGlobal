import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { CookiePreferenceCenter } from "@/components/legal/cookie-banner";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Cookies a preference",
  description: "Informace o cookies a centrum preferencí MedScopeGlobal.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Cookies a preference"
      description="Jak používáme cookies a jak spravovat své preference."
    >
      <h2>Typy cookies</h2>
      <ul>
        <li>
          <strong>Nezbytné</strong> — přihlášení, bezpečnost, jazyk (vždy aktivní)
        </li>
        <li>
          <strong>Analytické</strong> — anonymní statistiky návštěvnosti
        </li>
        <li>
          <strong>Marketingové</strong> — personalizace reklam (pouze se souhlasem)
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
