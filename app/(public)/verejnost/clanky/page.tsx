import type { Metadata } from "next";

import Link from "next/link";

import { ModulePageShell } from "@/components/b2b/module-page-shell";

import { VerejnostArticleExpandable } from "@/components/verejnost/verejnost-article-expandable";
import { resolveVerejnostCoverUrl } from "@/lib/verejnost/resolve-cover";

import {

  BACKEND_PUBLIC_TOPICS,

  resolveBackendTopic,

  topicLabelForSlug,

} from "@/lib/config/verejnost-topics";

import { listPublicArticles } from "@/lib/queries/verejnost";

import { buildV20PageMetadata } from "@/lib/v20/seo";



export const revalidate = 120;



export async function generateMetadata({ searchParams }: { searchParams: Promise<{ topic?: string }> }): Promise<Metadata> {

  const { topic } = await searchParams;

  const title = topic ? `${topicLabelForSlug(topic)} — Veřejné zdraví` : "Články — Veřejné zdraví";

  return buildV20PageMetadata({

    title: `${title} | MedScopeGlobal`,

    description: "Aktuální články o prevenci, výživě, spánku, stresu a zdravém životním stylu.",

    path: topic ? `/verejnost/clanky?topic=${topic}` : "/verejnost/clanky",

  });

}



type Props = { searchParams: Promise<{ topic?: string }> };



export default async function VerejnostClankyPage({ searchParams }: Props) {

  const { topic } = await searchParams;

  const backendTopic = resolveBackendTopic(topic);

  const articles = await listPublicArticles({

    limit: 48,

    topic: backendTopic,

    ensureContent: true,

    mode: "full",

  });



  const title = topic ? topicLabelForSlug(topic) : "Všechny články";

  const description = backendTopic

    ? BACKEND_PUBLIC_TOPICS.find((t) => t.slug === backendTopic)?.description

    : "Srozumitelné články o zdraví, prevenci a každodenních rozhodnutích pro veřejnost.";



  return (

    <ModulePageShell

      eyebrow="Veřejné zdraví"

      title={title}

      description={description ?? "Články pro širokou veřejnost."}

      ctaHref="/verejnost"

      ctaLabel="Hub veřejné zdraví"

    >

      <Link href="/verejnost" className="mb-6 inline-block text-sm text-[#005B96] hover:underline">

        ← Zpět na přehled

      </Link>



      <div className="mb-8 flex flex-wrap gap-2">

        <Link

          href="/verejnost/clanky"

          className={`rounded-full px-3 py-1 text-sm ${

            !topic ? "bg-[#005B96] text-white" : "border border-[#005B96]/30 text-[#005B96]"

          }`}

        >

          Vše

        </Link>

        {BACKEND_PUBLIC_TOPICS.map((t) => (

          <Link

            key={t.slug}

            href={`/verejnost/clanky?topic=${t.slug}`}

            prefetch

            className={`rounded-full px-3 py-1 text-sm ${

              topic === t.slug ? "bg-[#005B96] text-white" : "border border-[#005B96]/30 text-[#005B96]"

            }`}

          >

            {t.label}

          </Link>

        ))}

      </div>



      {articles.length ? (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {articles.map((item) => (

            <VerejnostArticleExpandable
              key={item.id}
              article={item}
              coverUrl={resolveVerejnostCoverUrl(item)}
            />

          ))}

        </div>

      ) : (

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">

          {topic ? (

            <p>V tématu „{title}“ zatím nejsou publikované články.</p>

          ) : (

            <p>Články pro veřejnost se brzy objeví — sledujte medscopeglobal.com.</p>

          )}

        </div>

      )}

    </ModulePageShell>

  );

}


