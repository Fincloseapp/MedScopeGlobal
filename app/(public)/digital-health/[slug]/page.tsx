import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCuratedDigitalHealthBySlug } from "@/lib/v21/curated/digital-health";
import { buildModuleSections, ensureCzechText, formatCsDate } from "@/lib/v21/enrich";
import { v21ImageForModule } from "@/lib/v21/images";
import { V21ModuleDetailView } from "@/components/v21/module-detail-view";
import { getDigitalHealthBySlug } from "@/lib/queries/v4c/digital-health";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDigitalHealthBySlug(slug);
  const curated = getCuratedDigitalHealthBySlug(slug);
  return { title: db?.title ?? curated?.title ?? "Digitální zdravotnictví" };
}

export const dynamic = "force-dynamic";

export default async function DigitalHealthDetailPage({ params }: Props) {
  const { slug } = await params;
  const curated = getCuratedDigitalHealthBySlug(slug);

  if (curated) {
    const sections = [
      { title: "Souhrn", body: curated.summaryCs },
      { title: "Co to je", body: curated.whatIsCs },
      { title: "Trendy", body: curated.trendsCs },
      { title: "Rizika", body: curated.risksCs },
      { title: "Legislativa", body: curated.legislationCs },
      { title: "Příklady v praxi", body: curated.examplesCs },
    ];
    return (
      <article className="v21-dh-detail mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/digital-health" className="text-sm font-medium text-primary hover:underline">
          ← Digitální zdravotnictví
        </Link>
        <header className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Digitální zdravotnictví · {curated.topic}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">{curated.title}</h1>
        </header>
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
          <Image src={curated.imageUrl} alt={curated.title} fill className="object-cover" sizes="896px" priority />
        </div>
        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl font-semibold text-[#021d33]">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-700">{s.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-8">
          <a href={curated.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Zdroj: {curated.source.name} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>
      </article>
    );
  }

  const item = await getDigitalHealthBySlug(slug);
  if (!item) notFound();

  const sections = buildModuleSections({
    topic: ensureCzechText(item.title, "Digitální zdravotnictví"),
    summary: item.summary,
    body: item.body,
    source: "WHO / EU eHealth / MZČR",
    moduleLabel: "Digitální zdravotnictví",
  });

  return (
    <V21ModuleDetailView
      backHref="/digital-health"
      backLabel="Digitální zdravotnictví"
      eyebrow="Digitální zdravotnictví"
      title={ensureCzechText(item.title, "Digitální zdravotnictví")}
      subtitle={item.topic ?? "eHealth"}
      dateLabel={formatCsDate(item.published_date)}
      imageUrl={item.image_url ?? v21ImageForModule("digitalHealth", item.slug)}
      sections={sections}
      source="WHO / MZČR"
      sourceUrl={item.source_url}
      badge={item.topic ?? undefined}
    />
  );
}
