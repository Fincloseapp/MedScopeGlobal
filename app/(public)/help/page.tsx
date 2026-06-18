import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Nápověda",
  description:
    "Časté dotazy k MedScopeGlobal — účet, předplatné, obsah, AI asistent a technická podpora.",
  path: "/help",
});

const FAQ = [
  {
    q: "Jak se zaregistruji?",
    a: "Registraci spustíte na stránce Registrace. Po potvrzení e-mailu získáte přístup k veřejnému obsahu.",
  },
  {
    q: "Jak funguje předplatné?",
    a: "Tarify a platby najdete v sekci Předplatné. Předplatné spravujete ve svém účtu; platby zpracovává Stripe.",
  },
  {
    q: "Mohu používat obsah v praxi?",
    a: "Obsah slouží ke vzdělávání a informování. Nepředstavuje individuální lékařskou radu ani diagnózu.",
  },
  {
    q: "Jak kontaktovat podporu?",
    a: "Napište na support@medscopeglobal.com nebo využijte kontaktní formulář.",
  },
];

export default function HelpPage() {
  return (
    <ModulePageShell
      eyebrow="Nápověda"
      title="Jak vám můžeme pomoci"
      description="Odpovědi na nejčastější dotazy k účtu, předplatnému a obsahu MedScopeGlobal."
      ctaHref="/kontakt"
      ctaLabel="Kontaktovat podporu"
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>Nápověda</span>
      </nav>

      <div className="grid gap-4 sm:grid-cols-2">
        {FAQ.map((item) => (
          <article
            key={item.q}
            className="rounded-2xl border border-[#dfeaf5] bg-white p-5 shadow-sm"
          >
            <h2 className="font-display text-lg font-semibold text-[#021d33]">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-xl border bg-[#f8fbff] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Užitečné odkazy
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          <li>
            <Link href="/predplatne" className="rounded-full border px-3 py-1 hover:bg-muted">
              Předplatné
            </Link>
          </li>
          <li>
            <Link href="/account" className="rounded-full border px-3 py-1 hover:bg-muted">
              Můj účet
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="rounded-full border px-3 py-1 hover:bg-muted">
              Ochrana soukromí
            </Link>
          </li>
          <li>
            <Link href="/terms" className="rounded-full border px-3 py-1 hover:bg-muted">
              Obchodní podmínky
            </Link>
          </li>
        </ul>
      </section>
    </ModulePageShell>
  );
}
