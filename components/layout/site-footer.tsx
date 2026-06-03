import Link from "next/link";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export async function SiteFooter() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  const isCs = locale === "cs";

  return (
    <footer className="border-t bg-medical-light">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div>
          <p className="font-display text-lg font-semibold text-medical-navy">MedScopeGlobal</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {isCs
              ? "Odborný magazín pro lékaře, studenty medicíny a výzkumníky v ČR a na Slovensku."
              : "Evidence-based medical magazine for clinicians and researchers."}
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground">{isCs ? "Prozkoumat" : "Explore"}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                {t(dict, "nav.home", "Domů")}
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-foreground">
                {t(dict, "nav.articles", "Články")}
              </Link>
            </li>
            <li>
              <Link href="/pro-koho" className="hover:text-foreground">
                {isCs ? "Pro koho" : "Audiences"}
              </Link>
            </li>
            <li>
              <Link href="/medicina" className="hover:text-foreground">
                Medicína
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">{isCs ? "Účet" : "Account"}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="hover:text-foreground">
                {t(dict, "nav.login", "Přihlásit")}
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-foreground">
                {t(dict, "nav.signup", "Registrace")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">{isCs ? "Právní" : "Legal"}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/vop" className="hover:text-foreground">
                {isCs ? "Obchodní podmínky" : "Terms of Service"}
              </Link>
            </li>
            <li>
              <Link href="/gdpr" className="hover:text-foreground">
                GDPR
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-foreground">
                Cookies
              </Link>
            </li>
            <li>
              <Link href="/pravo" className="hover:text-foreground">
                {isCs ? "Právní upozornění" : "Legal notice"}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">{isCs ? "Editorial" : "Editorial"}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {isCs
              ? "Obsah je určen ke vzdělávání. Pro lékařská rozhodnutí vždy konzultujte kvalifikovaného odborníka."
              : "Content is for education. Consult qualified clinicians for medical decisions."}
          </p>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MedScopeGlobal. {isCs ? "Všechna práva vyhrazena." : "All rights reserved."}
      </div>
    </footer>
  );
}
