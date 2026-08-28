import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { getPortalUi, showCzechAcademyPrep } from "@/lib/i18n/portal-copy";
import { V271_FOOTER_TRUST } from "@/lib/v271/homepage";

export async function SiteFooter({ locale = "cs" }: { locale?: string }) {
  const ui = getPortalUi(locale);
  const czech = showCzechAcademyPrep(locale);
  const audiences = czech
    ? V271_FOOTER_TRUST.audiences
    : [
        { label: ui.publicOverview, href: "/verejnost" },
        { label: ui.vipProtocols, href: "/vip/protokoly" },
        { label: ui.navDoctors, href: "/lekari/dokumentace" },
        { label: ui.students, href: "/studenti" },
      ];
  const proof = czech
    ? V271_FOOTER_TRUST.proof
    : [
        { label: "2 800+", href: "/studenti" },
        { label: "500+", href: "/articles" },
        { label: ui.trial14, href: "/predplatne?trial=1" },
      ];

  return (
    <footer className="border-t bg-slate-50" aria-label={ui.footerLegal}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <MedScopeLogo href="/" preset="footer" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ui.footerTagline}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#005B96]">
            {ui.footerEvidence}
          </p>
        </div>

        <div>
          <p className="font-medium text-foreground">{ui.footerTrust}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#005B96]/90">
            {ui.footerAudiences}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {audiences.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#005B96]/90">
            {ui.footerProof}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {proof.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">{ui.footerExplore}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                {ui.home}
              </Link>
            </li>
            <li>
              <Link href="/aplikace" className="hover:text-foreground">
                {ui.apps}
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-foreground">
                {ui.readArticles} · VitaScope
              </Link>
            </li>
            <li>
              <Link href="/vip/protokoly" className="hover:text-foreground">
                {ui.vipProtocols}
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
            {czech ? (
              <li>
                <Link href="/app/priprava" className="hover:text-foreground">
                  {ui.mediprepLegacy}
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/verejnost/temata" className="hover:text-foreground">
                {ui.findProblem}
              </Link>
            </li>
            <li>
              <Link href="/ai-asistent/verejnost" className="hover:text-foreground">
                {ui.askAi}
              </Link>
            </li>
            <li>
              <Link href="/verejnost" className="hover:text-foreground">
                {ui.publicOverview}
              </Link>
            </li>
            <li>
              <Link href="/predplatne" className="hover:text-foreground">
                {ui.navSubscribe}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">{ui.footerLegal}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                {ui.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                {ui.terms}
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-foreground">
                {ui.cookies}
              </Link>
            </li>
            <li>
              <Link href="/znacka" className="hover:text-foreground">
                {ui.brandIp}
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="hover:text-foreground">
                {ui.contact}
              </Link>
            </li>
            <li>
              <Link href="/o-nas" className="hover:text-foreground">
                {ui.about}
              </Link>
            </li>
            <li>
              <Link href="/subscribe" className="hover:text-foreground">
                {ui.signup}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MedScopeGlobal · Al Synaptica Research Institute s.r.o., IČO
        06024963 — {ui.copyrightNote}
      </div>
    </footer>
  );
}
