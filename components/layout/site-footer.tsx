import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { getSiteVersionLabel } from "@/lib/v27/version";

export async function SiteFooter() {

  return (

    <footer className="border-t bg-slate-50">

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">

        <div>

          <MedScopeLogo href="/" preset="footer" />

          <p className="mt-2 text-sm text-muted-foreground">

            Odborný medicínský portál pro lékaře, studenty medicíny a výzkumníky v ČR.

          </p>

        </div>

        <div>

          <p className="font-medium text-foreground">Prozkoumat</p>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">

            <li><Link href="/" className="hover:text-foreground">Domů</Link></li>

            <li><Link href="/articles" className="hover:text-foreground">Články</Link></li>

            <li><Link href="/verejnost" className="hover:text-foreground">Veřejnost</Link></li>

            <li><Link href="/studium" className="hover:text-foreground">Studenti</Link></li>

            <li><Link href="/studie" className="hover:text-foreground">Studie</Link></li>

            <li><Link href="/odborna" className="hover:text-foreground">Odborníci (ČLK)</Link></li>

            <li><Link href="/odborne/briefy" className="hover:text-foreground">Odborné briefy</Link></li>

            <li><Link href="/medicina" className="hover:text-foreground">Studium medicíny</Link></li>

            <li><Link href="/studium/univerzity" className="hover:text-foreground">Lékařské fakulty</Link></li>

            <li><Link href="/studium/prijimacky" className="hover:text-foreground">Přijímačky</Link></li>

          </ul>

        </div>

        <div>

          <p className="font-medium text-foreground">Právní</p>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">

            <li><Link href="/privacy" className="hover:text-foreground">Ochrana soukromí</Link></li>

            <li><Link href="/terms" className="hover:text-foreground">Podmínky</Link></li>

            <li><Link href="/cookies" className="hover:text-foreground">Cookies</Link></li>

            <li><Link href="/contact" className="hover:text-foreground">Kontakt</Link></li>

          </ul>

        </div>

        <div>

          <p className="font-medium text-foreground">Pro odborníky</p>

          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">

            <li><Link href="/odborne" className="hover:text-foreground">Odborná sekce</Link></li>

            <li><Link href="/subscribe" className="hover:text-foreground">Předplatné</Link></li>

            <li><Link href="/signup" className="hover:text-foreground">Registrace</Link></li>

          </ul>

        </div>

      </div>

      <div className="border-t py-6 text-center text-xs text-muted-foreground">

        © {new Date().getFullYear()} MedScopeGlobal — obsah pro vzdělávání, nenahrazuje lékařskou radu. · {getSiteVersionLabel()}

      </div>

    </footer>

  );

}


