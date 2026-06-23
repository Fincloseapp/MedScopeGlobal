import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { V271_FOOTER_SOCIAL_PROOF, V271_FOOTER_TAGLINE } from "@/lib/v271/homepage";

export async function SiteFooter() {
  return (
    <footer className="border-t bg-slate-50" aria-label="Patička webu">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <MedScopeLogo href="/" preset="footer" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{V271_FOOTER_TAGLINE}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#005B96]">
            Evidence-based medicína v češtině
          </p>
        </div>

        <div>
          <p className="font-medium text-foreground">Důvěra a čísla</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {V271_FOOTER_SOCIAL_PROOF.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">Prozkoumat</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Domů
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-foreground">
                Články
              </Link>
            </li>
            <li>
              <Link href="/verejnost/temata" className="hover:text-foreground">
                Najdi svůj problém
              </Link>
            </li>
            <li>
              <Link href="/verejnost/clanky" className="hover:text-foreground">
                Články pro veřejnost
              </Link>
            </li>
            <li>
              <Link href="/ai-asistent/verejnost" className="hover:text-foreground">
                Zeptej se AI
              </Link>
            </li>
            <li>
              <Link href="/verejnost" className="hover:text-foreground">
                Veřejnost — přehled
              </Link>
            </li>
            <li>
              <Link href="/studium" className="hover:text-foreground">
                Studenti
              </Link>
            </li>
            <li>
              <Link href="/studie" className="hover:text-foreground">
                Studie
              </Link>
            </li>
            <li>
              <Link href="/odborna" className="hover:text-foreground">
                Odborníci (ČLK)
              </Link>
            </li>
            <li>
              <Link href="/predplatne" className="hover:text-foreground">
                Předplatné
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">Právní a kontakt</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Ochrana soukromí
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Podmínky
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-foreground">
                Cookies
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="hover:text-foreground">
                Kontakt
              </Link>
            </li>
            <li>
              <Link href="/o-nas" className="hover:text-foreground">
                O nás
              </Link>
            </li>
            <li>
              <Link href="/subscribe" className="hover:text-foreground">
                Registrace
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MedScopeGlobal — obsah pro vzdělávání, nenahrazuje lékařskou radu.
      </div>
    </footer>
  );
}
