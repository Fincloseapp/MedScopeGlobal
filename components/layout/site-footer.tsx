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
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 xl:grid-cols-7">
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
            <li>
              <Link href="/kongresy" className="hover:text-foreground">
                {isCs ? "Kongresy" : "Congresses"}
              </Link>
            </li>
            <li>
              <Link href="/hledat" className="hover:text-foreground">
                {isCs ? "Vyhledávání" : "Search"}
              </Link>
            </li>
            <li>
              <Link href="/o-nas" className="hover:text-foreground">
                {isCs ? "O nás" : "About"}
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="hover:text-foreground">
                {isCs ? "Kontakt" : "Contact"}
              </Link>
            </li>
            <li>
              <Link href="/predplatne" className="hover:text-foreground">
                {isCs ? "Předplatné" : "Subscribe"}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">{isCs ? "B2B" : "B2B"}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/organizace" className="hover:text-foreground">
                {isCs ? "Organizace" : "Organizations"}
              </Link>
            </li>
            <li>
              <Link href="/inzerce" className="hover:text-foreground">
                {isCs ? "Inzerce" : "Advertising"}
              </Link>
            </li>
            <li>
              <Link href="/studijni-spoluprace" className="hover:text-foreground">
                {isCs ? "Studijní spolupráce" : "Study collaboration"}
              </Link>
            </li>
            <li>
              <Link href="/dokumentace" className="hover:text-foreground">
                {isCs ? "Dokumentace" : "Documentation"}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">{isCs ? "Obsah" : "Content"}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/studie" className="hover:text-foreground">Studie</Link></li>
            <li><Link href="/leky/novinky" className="hover:text-foreground">{isCs ? "Léky" : "Drugs"}</Link></li>
            <li><Link href="/legislativa" className="hover:text-foreground">Legislativa</Link></li>
            <li><Link href="/digital-health" className="hover:text-foreground">Digital Health</Link></li>
            <li><Link href="/novinky" className="hover:text-foreground">Novinky</Link></li>
            <li><Link href="/newsletter" className="hover:text-foreground">Newsletter</Link></li>
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
