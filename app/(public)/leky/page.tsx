import type { Metadata } from "next";

import Image from "next/image";

import Link from "next/link";

import { ModulePageShell } from "@/components/b2b/module-page-shell";

import { V4cContentCard } from "@/components/v4c/content-card";

import { getDrugNewsList } from "@/lib/queries/v4c/drug-news";

import { DRUG_AGENCIES } from "@/lib/v4c/sources";

import { V21_MEDICAL_IMAGES } from "@/lib/v21/images";
import { resolveManyImages } from "@/lib/v25/images/resolve-many";



export const revalidate = 120;



export const metadata: Metadata = {

  title: "Léky — MedScopeGlobal",

  description: "Lékové novinky, schválení a pipeline — monitoring EMA, FDA, SÚKL v češtině.",

};



const HUB_LINKS = [

  { href: "/leky/novinky", label: "Novinky o lécích", desc: "Registrace, SPC, úhrady" },

  { href: "/leky/schvalene", label: "Schválené léky", desc: "Nová registrace a indikace" },

  { href: "/leky/pipeline", label: "Pipeline", desc: "Připravované přípravky" },

  { href: "/ai/leky", label: "AI léky", desc: "Odborný AI přehled" },

];



export default async function LekyHubPage() {

  const latest = await getDrugNewsList();
  const preview = await resolveManyImages(latest.slice(0, 6), "drug_news");



  return (

    <ModulePageShell

      eyebrow="Léky"

      title="Léky a farmakoterapie"

      description="Profesionální monitoring EMA, FDA a SÚKL — novinky, schválení a vývojové pipeline."

      ctaHref="/leky/novinky"

      ctaLabel="Všechny novinky"

    >

      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-slate-100">

        <Image

          src={V21_MEDICAL_IMAGES.drug}

          alt="Farmakoterapie a léková bezpečnost"

          fill

          className="object-cover"

          sizes="100vw"

          priority

        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/80 to-transparent" />

        <div className="absolute bottom-0 left-0 p-6 text-white">

          <p className="text-sm text-white/90">Evidence-based přehled pro klinickou praxi</p>

        </div>

      </div>



      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {HUB_LINKS.map((l) => (

          <Link

            key={l.href}

            href={l.href}

            prefetch

            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/40 hover:shadow-md"

          >

            <p className="font-semibold text-[#021d33]">{l.label}</p>

            <p className="mt-1 text-xs text-slate-500">{l.desc}</p>

          </Link>

        ))}

      </div>



      <h2 className="font-display text-xl font-semibold text-[#021d33]">Nejnovější lékové novinky</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">

        {preview.map((d) => (

          <V4cContentCard

            key={d.id}

            href={`/leky/novinky/${d.slug}`}

            title={d.title}

            meta={[d.agency, d.drug_name, d.published_date].filter(Boolean).join(" · ")}

            summary={d.summary}

            badge={d.status}

            imageUrl={d.resolvedImageUrl}

            imageAlt={d.drug_name ?? d.title}

          />

        ))}

      </div>



      <p className="mt-8 text-xs text-slate-500">{DRUG_AGENCIES.map((a) => a.name).join(" · ")}</p>

    </ModulePageShell>

  );

}


