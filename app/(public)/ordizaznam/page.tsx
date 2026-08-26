import type { Metadata } from "next";
import Link from "next/link";
import {
  Mic,
  FileText,
  Shield,
  Lock,
  Smartphone,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { ORDIZAPIS_APP } from "@/lib/apps/catalog";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { softwareApplicationJsonLd } from "@/lib/ecosystem/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "OrdiZáznam — Profesionální nástroj pro lékaře | MedScopeGlobal",
  description:
    "OrdiZáznam: nahrávejte v mobilu diktát nebo konzultaci → odborná anamnéza a klinický zápis. GDPR, šifrování, 14 dní zdarma.",
  path: "/ordizaznam",
});

const FEATURES = [
  {
    icon: Mic,
    title: "Nahrávání v mobilu",
    description: "Diktát nebo konzultace s pacientem — AI vytvoří strukturovaný zápis.",
  },
  {
    icon: FileText,
    title: "Profesionální šablony",
    description: "Ambulantní, SOAP, anamnéza, propouštěcí zprávy a další.",
  },
  {
    icon: Smartphone,
    title: "Mobil ↔ Web sync",
    description: "Historie zápisů synchronizovaná mezi telefonem a počítačem.",
  },
  {
    icon: Clock,
    title: "Úspora času",
    description: "Průměrně 15 minut ušetřených na každém zápisu.",
  },
  {
    icon: Shield,
    title: "GDPR kompatibilita",
    description: "Data zpracovávána v EU, plná compliance s nařízením GDPR.",
  },
  {
    icon: Lock,
    title: "End-to-end šifrování",
    description: "Záznamy šifrovány v klidu i při přenosu.",
  },
];

const PRICING = [
  { name: "OrdiZáznam", price: "390 Kč", period: "/měsíc", features: ["Neomezené zápisy", "Všechny šablony", "Mobil + web", "14 dní zdarma"] },
  { name: "Lékař v praxi", price: "490 Kč", period: "/měsíc", features: ["OrdiZáznam v ceně", "Guidelines & CME", "Klinický AI asistent", "Odborná sekce"], highlight: true },
];

export default function OrdiZaznamPage() {
  const jsonLd = softwareApplicationJsonLd({
    name: "OrdiZáznam",
    description: ORDIZAPIS_APP.pitch,
    url: "https://medscopeglobal.com/app/dokumentace",
    price: "390",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021d33] via-[#003d6b] to-[#005B96] px-4 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8dc4ea]">
            Profesionální nástroj pro lékaře
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            OrdiZáznam
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Nahrajte v telefonu diktát nebo konzultaci s pacientem → odborná anamnéza a klinický zápis.
            Ušetřete 15 minut na každém zápisu.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/app/dokumentace"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#005B96] hover:bg-white/90"
            >
              Vyzkoušet demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/predplatne"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
            >
              14 dní zdarma
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-[#021d33]">Funkce a výhody</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <f.icon className="h-8 w-8 text-[#005B96]" />
              <h3 className="mt-3 font-semibold text-[#021d33]">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#f7fafc] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-[#021d33]">Ceník</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-[#005B96] bg-white shadow-lg ring-2 ring-[#005B96]/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <h3 className="font-semibold text-[#021d33]">{plan.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/predplatne"
                  className={`mt-6 block rounded-full py-2.5 text-center text-sm font-semibold ${
                    plan.highlight
                      ? "bg-[#005B96] text-white hover:bg-[#004a7a]"
                      : "border border-[#005B96] text-[#005B96] hover:bg-[#005B96]/5"
                  }`}
                >
                  Vybrat tarif
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">Právní upozornění</h3>
          <p className="mt-2 text-sm text-amber-800">
            OrdiZáznam je nástroj pro dokumentaci, nikoli náhrada klinického úsudku. Lékař nese plnou
            odpovědnost za obsah a správnost zápisu. Data jsou zpracovávána v souladu s GDPR (EU)
            a ukládána na serverech v EU. OrdiZáznam není certifikován jako zdravotnický prostředek.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#021d33] px-4 py-12 text-center text-white">
        <h2 className="font-display text-2xl font-bold">Začněte ještě dnes</h2>
        <p className="mt-2 text-white/70">14 dní zdarma · Bez závazků · Zrušení kdykoliv</p>
        <Link
          href="/app/dokumentace"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#005B96] px-8 py-3 font-semibold hover:bg-[#004a7a]"
        >
          Spustit OrdiZáznam <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}
