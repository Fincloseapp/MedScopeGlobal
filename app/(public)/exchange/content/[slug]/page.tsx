import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

const BRIEFS: Record<string, { title: string; body: string[] }> = {
  "eu-mdr-b2b-listing-checklist": {
    title: "EU MDR listing checklist for B2B device offers",
    body: [
      "A CE-marked device listing on MedScope Exchange must name the legal manufacturer, the intended purpose, the class (as declared by the advertiser) and the regions where the offer may be published.",
      "MedScopeGlobal does not act as a notified body. The advertiser remains responsible for the technical file and post-market surveillance.",
      "Do not attach patient data, UDI traces tied to named individuals, or consumer-facing drug claims.",
    ],
  },
  "poc-immunoassay-procurement-brief": {
    title: "POC immunoassay procurement brief for hospital labs",
    body: [
      "Hospital laboratories typically score throughput, connectivity (HL7/FHIR), service coverage in the target region, and CE documentation completeness.",
      "This brief is educational B2B context. It is not a clinical protocol and not a tender.",
    ],
  },
  "why-healthcare-b2b-needs-regional-filters": {
    title: "Why regional availability is a safety control, not a marketing filter",
    body: [
      "A device cleared in one jurisdiction is not automatically lawful to offer in another. Exchange therefore requires EU / USA / Asia / Global on every listing.",
      "Buyers can combine filters (for example EU + Asia). Global listings match every region. This reduces accidental cross-border offers.",
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(BRIEFS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const { slug } = await params;
  const brief = BRIEFS[slug];
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: brief?.title ?? copy.contentTitle,
    description: copy.contentLead,
    path: `/exchange/content/${slug}`,
    locale,
  });
}

export default async function ExchangeContentBriefPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const { slug } = await params;
  const brief = BRIEFS[slug];
  if (!brief) {
    return (
      <ModulePageShell eyebrow={copy.contentTitle} title={copy.contentTitle} description={copy.contentLead}>
        <p>{copy.empty}</p>
      </ModulePageShell>
    );
  }
  return (
    <ModulePageShell eyebrow={copy.contentTitle} title={brief.title} description={copy.contentLead}>
      <div className="prose prose-slate max-w-none text-sm leading-7">
        {brief.body.map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>
    </ModulePageShell>
  );
}
