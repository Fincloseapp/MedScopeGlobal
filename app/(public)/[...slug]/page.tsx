import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EngineCard } from "@/components/content/engine-card";
import { loadSectionPageData } from "@/lib/content-engine/ai-content";

const breadcrumbCatalog: Record<string, string> = {
  "professional": "Professional",
  "clinical-insights": "Clinical Insights",
  "case-reports": "Case Reports",
  "guidelines": "Guidelines",
  "research": "Research",
  "articles": "Research Articles",
  "clinical-studies": "Clinical Studies",
  "preprints": "Preprints",
  "student-research": "Student Research",
  "economics": "Healthcare Economics",
  "costs-drg": "Costs & DRG",
  "insurance": "Insurance & Reimbursement",
  "market-analysis": "Market Analysis",
  "digital-health": "Digital Health",
  "ehealth": "eHealth",
  "ai": "AI in medicine",
  "systems": "Systems & data",
  "policy": "Regulation & Policy",
  "legislation": "Legislation",
  "compliance": "Compliance",
  "healthcare-law": "Healthcare Law",
  "pharma": "Pharma & Drugs",
  "new-drugs": "New Drugs",
  "drug-reviews": "Drug Reviews",
  "clinical-trials": "Clinical Trials",
  "news": "News & Updates",
  "daily": "Daily News",
  "key-updates": "Key Updates",
  "events": "Congresses & Events",
  "conferences": "Conferences",
  "webinars": "Webinars",
  "reports": "Reports",
  "careers": "Careers",
  "subscribe": "Subscribe",
  "submit-research": "Submit Research",
};

function humanizeSegment(segment: string): string {
  return breadcrumbCatalog[segment] ?? segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildBreadcrumbs(slug: string) {
  const segments = slug.split("/").filter(Boolean);
  const breadcrumbs = [{ label: "Home", href: "/" }];

  let currentPath = "";
  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : `/${segment}`;
    breadcrumbs.push({
      label: humanizeSegment(segment),
      href: currentPath,
    });
  }

  return breadcrumbs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const key = resolvedParams.slug?.join("/") ?? "";
  const data = await loadSectionPageData(key);

  return data
    ? {
        title: `${data.title} | MedScopeGlobal`,
        description: data.description,
      }
    : {
        title: "Section | MedScopeGlobal",
      };
}

export default async function SectionRoutePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const key = resolvedParams.slug?.join("/") ?? "";
  const data = await loadSectionPageData(key);

  if (!data) notFound();

  const breadcrumbs = buildBreadcrumbs(key);

  return (
    <div className="bg-[#fafcff]">
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.12),transparent_30%),linear-gradient(180deg,#fff_0%,#f8fbff_45%,#f6fbff_100%)]">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.href}-${index}`} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-400">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-[#005B96]">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-[#005B96] hover:underline">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">{data.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33] sm:text-5xl">
              {data.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{data.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-[#005B96] text-white hover:bg-[#004874]">
                <Link href={data.cta.href}>
                  {data.cta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/subscribe"
                className="inline-flex items-center rounded-full border border-[#8dc4ea] px-4 py-2 text-sm font-medium text-[#005B96] transition hover:bg-[#f4fbff]"
              >
                Subscribe for deeper coverage
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {data.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[#cfe1f3] bg-white/85 p-4 shadow-[0_12px_30px_-24px_rgba(0,91,150,0.65)] backdrop-blur">
                  <p className="text-2xl font-bold text-[#021d33]">{metric.value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">Editorial feed</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">Curated content stream</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Live-backed summaries, AI-reframed insights, and continuing coverage mapped to the section you selected.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item) => (
            <EngineCard key={`${item.title}-${item.source}`} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
