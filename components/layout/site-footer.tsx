import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";

export async function SiteFooter({ locale = "cs" }: { locale?: string }) {
  const copy = getSurfaceCopy(locale);
  const footer = copy.footer;
  return (
    <footer className="border-t bg-slate-50" aria-label={footer.aria}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <MedScopeLogo href="/" preset="footer" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{footer.tagline}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#005B96]">
            {footer.evidence}
          </p>
        </div>

        <div>
          <p className="font-medium text-foreground">{footer.trustTitle}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#005B96]/90">
            {footer.forWhom}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {footer.audiences.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#005B96]/90">
            {footer.numbers}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {footer.proof.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">{footer.explore}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                {footer.home}
              </Link>
            </li>
            <li>
              <Link href="/aplikace" className="hover:text-foreground">
                {footer.apps}
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-foreground">
                {footer.articles}
              </Link>
            </li>
            <li>
              <Link href="/vip/protokoly" className="hover:text-foreground">
                {footer.vip}
              </Link>
            </li>
            <li>
              <Link href="/app/mediflow" className="hover:text-foreground">
                MediFlow
              </Link>
            </li>
            <li>
              <Link href="/app/pacient" className="hover:text-foreground">
                MeDipacient
              </Link>
            </li>
            <li>
              <Link href="/app/dokumentace" className="hover:text-foreground">
                OrdiZapis
              </Link>
            </li>
            <li>
              <Link href="/app/priprava" className="hover:text-foreground">
                MeDiprep (legacy)
              </Link>
            </li>
            <li>
              <Link href="/verejnost/temata" className="hover:text-foreground">
                {footer.findProblem}
              </Link>
            </li>
            <li>
              <Link href="/verejnost/clanky" className="hover:text-foreground">
                {footer.publicArticles}
              </Link>
            </li>
            <li>
              <Link href="/ai-asistent/verejnost" className="hover:text-foreground">
                {footer.askAi}
              </Link>
            </li>
            <li>
              <Link href="/verejnost" className="hover:text-foreground">
                {footer.publicOverview}
              </Link>
            </li>
            <li>
              <Link href="/studenti" className="hover:text-foreground">
                {footer.students}
              </Link>
            </li>
            <li>
              <Link href="/studie" className="hover:text-foreground">
                {footer.studies}
              </Link>
            </li>
            <li>
              <Link href="/odborna" className="hover:text-foreground">
                {footer.experts}
              </Link>
            </li>
            <li>
              <Link href="/predplatne" className="hover:text-foreground">
                {footer.subscribe}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">{footer.legal}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                {footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                {footer.terms}
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-foreground">
                {footer.cookies}
              </Link>
            </li>
            <li>
              <Link href="/znacka" className="hover:text-foreground">
                {footer.brand}
              </Link>
            </li>
            <li>
              <Link href="/pravni-checklist" className="hover:text-foreground">
                {footer.legalChecklist}
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="hover:text-foreground">
                {footer.contact}
              </Link>
            </li>
            <li>
              <Link href="/o-nas" className="hover:text-foreground">
                {footer.about}
              </Link>
            </li>
            <li>
              <Link href="/subscribe" className="hover:text-foreground">
                {footer.register}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MedScopeGlobal · Al Synaptica Research Institute s.r.o., IČO
        06024963 — {footer.copyright}
      </div>
    </footer>
  );
}
