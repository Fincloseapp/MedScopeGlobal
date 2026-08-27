import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ORDIZAPIS_APP } from "@/lib/apps/catalog";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { softwareApplicationJsonLd } from "@/lib/ecosystem/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "OrdiZáznam — Profesionální nástroj pro lékaře | MedScopeGlobal",
  description:
    "OrdiZáznam: nahrávejte v mobilu diktát nebo konzultaci → odborná anamnéza a klinický zápis. GDPR, šifrování, 14 dní zdarma.",
  path: "/ordizaznam",
});

const BENEFITS = [
  {
    title: "Diktát → strukturovaný zápis",
    description: "Nahrajte konzultaci v telefonu. OrdiZáznam sestaví anamnézu a klinický zápis.",
  },
  {
    title: "Mobil a web v synchronu",
    description: "Stejná historie zápisů v ordinaci i cestou — bez přepisování.",
  },
  {
    title: "GDPR a šifrování v EU",
    description: "Data v klidu i při přenosu. Nástroj pro dokumentaci, ne náhrada úsudku.",
  },
] as const;

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

      {/* Full-bleed product photo hero */}
      <section className="relative isolate min-h-[min(92vh,900px)] overflow-hidden bg-[#021d33] text-white">
        <Image
          src={APP_MARKETING_IMAGE.ordizapis}
          alt=""
          fill
          priority
          sizes="100vw"
          className="mkt-drift object-cover object-[85%_center] opacity-60 sm:object-[80%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#021d33] from-0% via-[#021d33]/95 via-40% to-[#021d33]/20 to-100%"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#021d33] via-transparent to-[#021d33]/45"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(92vh,900px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:justify-center lg:pb-24">
          <div className="max-w-lg lg:max-w-xl">
            <h1 className="mkt-rise font-display text-[clamp(3rem,9vw,5.5rem)] font-bold leading-[0.94] tracking-tight">
              OrdiZáznam
            </h1>
            <p className="mkt-rise-delay-1 mt-5 max-w-md text-lg leading-relaxed text-sky-50/85 sm:text-xl">
              Nahrajte diktát nebo konzultaci — hotový klinický zápis za minuty, ne za čtvrt hodiny.
            </p>
            <div className="mkt-rise-delay-2 mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/app/dokumentace"
                className="inline-flex items-center gap-2 bg-white px-7 py-3.5 text-sm font-semibold text-[#005B96] transition hover:bg-sky-50"
              >
                Vyzkoušet demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/predplatne"
                className="inline-flex items-center gap-2 border border-white/35 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                14 dní zdarma
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
            Proč lékaři přecházejí na OrdiZáznam
          </h2>
          <ol className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
            {BENEFITS.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-2 py-7 sm:grid-cols-[4rem_1fr] sm:items-baseline sm:gap-8"
              >
                <span className="font-display text-3xl font-bold text-[#005B96]/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#021d33]">{item.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Single clear offer — not a pricing card grid */}
      <section className="relative overflow-hidden bg-[#f0f6fb] px-4 py-16 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,91,150,0.12),transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
            Ceník
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
            390 Kč / měsíc
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Neomezené zápisy, všechny šablony, mobil + web. 14 dní zdarma. Tarif Lékař v praxi
            (490 Kč) přidá guidelines, CME a klinického AI asistenta.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/predplatne"
              className="inline-flex items-center gap-2 bg-[#005B96] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#004a7a]"
            >
              Vybrat tarif
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/app/dokumentace"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#005B96] underline-offset-4 hover:underline"
            >
              Nejdřív demo
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-[#021d33]">Právní upozornění. </span>
          OrdiZáznam je nástroj pro dokumentaci, nikoli náhrada klinického úsudku. Lékař nese plnou
          odpovědnost za obsah a správnost zápisu. Data jsou zpracovávána v souladu s GDPR (EU).
          OrdiZáznam není certifikován jako zdravotnický prostředek.
        </p>
      </section>

      <section className="bg-[#021d33] px-4 py-14 text-center text-white sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Začněte ještě dnes</h2>
        <p className="mt-2 text-white/65">14 dní zdarma · Bez závazků · Zrušení kdykoliv</p>
        <Link
          href="/app/dokumentace"
          className="mt-7 inline-flex items-center gap-2 bg-[#005B96] px-8 py-3.5 font-semibold transition hover:bg-[#004a7a]"
        >
          Spustit OrdiZáznam
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>
    </>
  );
}
