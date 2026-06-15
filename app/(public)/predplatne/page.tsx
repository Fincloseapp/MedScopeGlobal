import type { Metadata } from "next";
import Link from "next/link";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import {
  V27_MINI_PRODUCTS,
  V27_SUBSCRIPTIONS,
  V27_EXPERT_PDFS,
} from "@/lib/v27/config";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Předplatné a produkty | MedScopeGlobal",
    description:
      "Předplatné pro studenty a lékaře, digitální mini-produkty a odborné PDF. Platba kartou, Apple Pay a Google Pay.",
    path: "/predplatne",
  });
}

export default function PredplatnePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          MedScope v27 · Monetizace
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Ceník a předplatné</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Tři pilíře: veřejné mini-produkty, odborné předplatné a B2B balíčky. Platba přes Stripe
          včetně Apple Pay a Google Pay.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Předplatné</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {Object.values(V27_SUBSCRIPTIONS).map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border border-[#005B96]/20 bg-white p-6 shadow-sm ring-1 ring-[#005B96]/10"
            >
              <h3 className="font-display text-xl font-semibold text-[#005B96]">{sub.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold">{sub.priceCzk} Kč</span>
                <span className="text-muted-foreground"> / měsíc</span>
              </p>
              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                {sub.id === "student" ? (
                  <>
                    <li>• Kvízy, studijní plány a AI tutor</li>
                    <li>• Přístup k modelovým otázkám</li>
                    <li>• Bez reklam ve studijní sekci</li>
                  </>
                ) : (
                  <>
                    <li>• Plný přístup k odborné sekci</li>
                    <li>• CME přehledy a guidelines</li>
                    <li>• Klinický AI asistent</li>
                  </>
                )}
              </ul>
              <div className="mt-6">
                <V27CheckoutButton kind="subscription" productId={sub.id} label="Aktivovat předplatné" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Digitální mini-produkty</h2>
        <p className="mt-1 text-sm text-slate-600">Pro veřejnost — jednorázový nákup PDF/e-book</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {V27_MINI_PRODUCTS.map((p) => (
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

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Odborné PDF</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {V27_EXPERT_PDFS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-[#021d33]">{p.name}</h3>
              <p className="mt-2 text-2xl font-bold text-[#005B96]">{p.priceCzk} Kč</p>
              <div className="mt-4">
                <V27CheckoutButton kind="expert_pdf" productId={p.id} label="Stáhnout po zaplacení" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        B2B nabídka pro firmy na{" "}
        <Link href="/pro-firmy" className="text-[#005B96] underline">
          /pro-firmy
        </Link>
        . Affiliate a sponzorované články v rámci obsahu.
      </p>
    </div>
  );
}
