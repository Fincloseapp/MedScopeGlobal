import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import {
  V271_AUDIENCES,
  V271_AKTUALNI,
  V271_B2B,
  V271_MINI_PRODUCTS,
  V271_SUBSCRIPTIONS,
} from "@/lib/v271/homepage";

export function V271AudienceSections() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Tři cílové skupiny
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
            Vyberte si svou cestu
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

export function V271AktualniBlock() {
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
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

export function V271MiniProductsBlock() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        Digitální produkty
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33]">
        Mini-produkty pro veřejnost
      </h2>
      <p className="mt-1 text-sm text-slate-600">Jednorázový nákup PDF — 149–249 Kč</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {V271_MINI_PRODUCTS.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#021d33]">{p.name}</h3>
            <p className="mt-2 text-2xl font-bold text-[#005B96]">{p.priceCzk} Kč</p>
            <div className="mt-4">
              <V27CheckoutButton kind="mini_product" productId={p.id} label="Koupit" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function V271SubscriptionBlock() {
  return (
    <section className="border-t border-slate-200 bg-gradient-to-b from-[#0A3D5C] to-[#004874] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
            Předplatné
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Student 149 Kč · Lékař 490 Kč</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">
            Plný přístup ke studijním nástrojům nebo odborné sekci včetně klinického AI.
          </p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {Object.values(V271_SUBSCRIPTIONS).map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur"
            >
              <h3 className="font-display text-xl font-semibold">{sub.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold">{sub.priceCzk} Kč</span>
                <span className="text-white/70"> / měsíc</span>
              </p>
              <div className="mt-6">
                <V27CheckoutButton kind="subscription" productId={sub.id} label="Aktivovat" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href="/predplatne" className="text-sm font-medium text-sky-200 hover:underline">
            Kompletní ceník a odborné PDF →
          </Link>
        </p>
      </div>
    </section>
  );
}

export function V271HomepageSections() {
  return (
    <>
      <V271AudienceSections />
      <V271B2bBlock />
      <V271AktualniBlock />
      <V271MiniProductsBlock />
      <V271SubscriptionBlock />
    </>
  );
}
