import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { V20ArticleCard } from "@/components/v20/article-card";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getArticlesByMetadataSection } from "@/lib/queries/articles";
import {
  V271_AUDIENCES,
  V271_AKTUALNI,
  V271_B2B,
  V271_SOCIAL_PROOF_STATS,
  V271_SUBSCRIPTION_PLANS,
  V271_TESTIMONIALS,
  V271_WHY_TRUST,
} from "@/lib/v271/homepage";
import { subscriptionProductId } from "@/lib/v27/config";

export function V272SocialProofBlock() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Důvěřují nám
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
            Čtenáři z celé České republiky
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
            Studenti LF, lékaři v praxi i laici, kteří chtějí spolehlivé zdravotní informace — ne
            generické rady z internetu.
          </p>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {V271_SOCIAL_PROOF_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center"
            >
              <dt className="font-display text-3xl font-bold text-[#005B96]">{stat.value}</dt>
              <dd className="mt-1 text-sm text-slate-600">{stat.label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {V271_TESTIMONIALS.map((item) => (
            <figure
              key={item.author}
              className="flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6"
            >
              <Quote className="h-8 w-8 text-[#005B96]/30" aria-hidden />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-slate-100 pt-4">
                <p className="font-semibold text-[#021d33]">{item.author}</p>
                <p className="text-xs text-slate-500">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function V272WhyTrustBlock() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Proč MedScopeGlobal
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
            Prémiový magazín, ne další zdravotní blog
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
            Redakční standard, ověřené zdroje a obsah psaný pro českou medicínu — od přijímaček po
            klinickou praxi.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {V271_WHY_TRUST.map((point) => (
            <article
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-semibold text-[#021d33]">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/predplatne?trial=1"
            className="rounded-full bg-[#005B96] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            Vyzkoušet 14 dní zdarma
          </Link>
          <Link
            href="/predplatne"
            className="rounded-full border border-[#005B96]/30 px-6 py-2.5 text-sm font-semibold text-[#005B96] hover:bg-[#005B96]/5"
          >
            Předplatit
          </Link>
        </div>
      </div>
    </section>
  );
}

export function V271AudienceSections() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Pro koho píšeme
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
            Obsah na míru vaší roli ve zdravotnictví
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {V271_AUDIENCES.map((aud) => (
            <article
              key={aud.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
                {aud.label}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-[#021d33]">{aud.label}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">{aud.description}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {aud.topics.map((t) => (
                  <li key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={aud.ctaPrimary.href}
                  className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
                >
                  {aud.ctaPrimary.label}
                </Link>
                <Link
                  href={aud.ctaSecondary.href}
                  className="rounded-full border border-[#005B96]/30 px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#005B96]/5"
                >
                  {aud.ctaSecondary.label}
                </Link>
              </div>
              <Link
                href={aud.href}
                className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96]"
              >
                Vstoupit do sekce <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function V271B2bBlock() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-[#005B96]/15 bg-[#005B96]/5 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">B2B</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-[#021d33]">{V271_B2B.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{V271_B2B.description}</p>
          </div>
          <Link
            href={V271_B2B.href}
            className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
          >
            {V271_B2B.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function V272AktualniBlock() {
  const { isVip, accessLevel } = await getReaderContext();
  const articles = await getArticlesByMetadataSection(
    "aktuální-zprávy",
    4,
    isVip,
    accessLevel,
    "cs"
  );

  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Zpravodajství
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
              {V271_AKTUALNI.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{V271_AKTUALNI.description}</p>
          </div>
          <Link
            href={V271_AKTUALNI.href}
            className="rounded-full border border-[#005B96]/30 px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#005B96]/5"
          >
            {V271_AKTUALNI.cta} →
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((article) => (
              <V20ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : null}
        <div className={articles.length > 0 ? "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
          {V271_AKTUALNI.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-[#021d33] transition hover:border-[#005B96]/40 hover:shadow-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function V272SubscriptionPlansBlock() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        Předplatné
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
        Plný přístup k prémiovému obsahu
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Začněte 14denní zkušební období zdarma — veřejnost, studenti i lékaři bez jednorázových PDF.
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {V271_SUBSCRIPTION_PLANS.map((plan) => (
          <div key={plan.tier} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#021d33]">{plan.name}</h3>
            <p className="mt-2">
              <span className="text-2xl font-bold text-[#005B96]">{plan.monthlyCzk} Kč</span>
              <span className="text-sm text-slate-500"> / měsíc</span>
            </p>
            <p className="text-sm text-slate-500">
              nebo <span className="font-medium text-[#005B96]">{plan.annualCzk} Kč</span> / rok
            </p>
            <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <Link
                href="/predplatne?trial=1"
                className="flex w-full items-center justify-center rounded-md bg-[#005B96] px-4 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
              >
                Vyzkoušet 14 dní zdarma
              </Link>
              <V27CheckoutButton
                kind="subscription"
                productId={subscriptionProductId(plan.tier, "month")}
                label="Předplatit"
              />
              <V27CheckoutButton
                kind="subscription"
                productId={subscriptionProductId(plan.tier, "year")}
                label="Předplatit ročně"
                className="w-full border border-[#005B96]/30 bg-white text-[#005B96] hover:bg-[#005B96]/5"
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center">
        <Link href="/predplatne" className="text-sm font-medium text-[#005B96] hover:underline">
          Kompletní ceník →
        </Link>
      </p>
    </section>
  );
}

export function V272SubscriptionHeroBlock() {
  return (
    <section className="border-t border-slate-200 bg-gradient-to-b from-[#0A3D5C] to-[#004874] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-7xl text-center text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
          Předplatné MedScopeGlobal
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">
          14 dní zdarma · poté od 99 Kč / měsíc
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">
          Studenti 149 Kč · lékaři 490 Kč. Roční plány ušetří až 2 měsíce. Platba kartou, Apple Pay
          a Google Pay přes Stripe.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/predplatne?trial=1"
            className="inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-sky-50"
          >
            Vyzkoušet 14 dní zdarma
          </Link>
          <Link
            href="/predplatne"
            className="inline-flex rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Předplatit
          </Link>
        </div>
      </div>
    </section>
  );
}

export function V272AcademyCtaBlock() {
  return (
    <section className="border-y border-[#005B96]/15 bg-gradient-to-r from-[#005B96]/5 to-[#0A3D5C]/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            MedScope Academy
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
            Kurzy, lekce a kvízy pro studenty i lékaře
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Gamifikace, certifikáty a AI lektor — interaktivní vzdělávání od anatomie po klinické
            dovednosti.
          </p>
        </div>
        <Link
          href="/academy"
          className="inline-flex rounded-full bg-[#005B96] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          Vstoupit do Academy
        </Link>
      </div>
    </section>
  );
}

export async function V272HomepageSections() {
  return (
    <>
      <V272SocialProofBlock />
      <V272WhyTrustBlock />
      <V271AudienceSections />
      <V272AcademyCtaBlock />
      <V271B2bBlock />
      <V272AktualniBlock />
      <V272SubscriptionPlansBlock />
      <V272SubscriptionHeroBlock />
    </>
  );
}

/** @deprecated Use V272HomepageSections */
export function V271HomepageSections() {
  return (
    <>
      <V271AudienceSections />
      <V271B2bBlock />
    </>
  );
}
