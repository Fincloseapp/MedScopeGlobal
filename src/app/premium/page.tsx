import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PremiumGatePanel } from "@/components/premium-gate";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Premium členství",
  description: "Premium vrstva klinických digestů, decision-support obsahu a pokročilých nástrojů pro odborníky.",
  alternates: { canonical: "/premium" }
};

const freeFeatures = [
  "Veřejné články a monitoring",
  "Newsletter a preference",
  "Události a kalendář",
  "Základní vyhledávání"
];

const premiumFeatures = [
  "Klinické digesty a evidence summaries",
  "Decision-support oriented content",
  "Pokročilé filtry a reading lists",
  "Uložený obsah a personalizace (roadmap)",
  "Prioritní přístup k novým sériím"
];

export default function PremiumPage() {
  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "Premium" }]} />
      <p className="eyebrow">Freemium model</p>
      <h1>Premium vrstva pro klinickou praxi a rozhodování</h1>
      <p className="lead">
        MedScopeGlobal kombinuje veřejný obsah s prémiovou vrstvou pro odborníky. Platby a subscription billing nejsou
        aktivní — architektura je připravena pro Stripe nebo institucionální fakturaci.
      </p>
      <div className="grid two pricing-grid">
        <article className="card">
          <span className="tag tier-free">Free</span>
          <h2>Základní přístup</h2>
          <ul className="highlights">
            {freeFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="button" href="/auth/register">
            Registrace zdarma
          </Link>
        </article>
        <article className="card premium-highlight">
          <span className="tag tier-premium">Premium</span>
          <h2>Odborný přístup</h2>
          <ul className="highlights">
            {premiumFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="button primary" href="/contact?topic=premium">
            Požádat o přístup
          </Link>
        </article>
      </div>
      <PremiumGatePanel />
      <section className="card">
        <h2>Co je potřeba pro aktivaci plateb</h2>
        <p>
          Pro produkční subscription je nutné nastavit platební bránu (např. Stripe) a env proměnné. Viz{" "}
          <code>.env.example</code> v repozitáři.
        </p>
        <p>
          Kontakt: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      </section>
    </main>
  );
}
