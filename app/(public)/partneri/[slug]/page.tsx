import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { InquiryForm } from "@/components/sales/inquiry-form";
import { salesPackageById } from "@/lib/sales/packages";
import { findActiveContractBySlug, findProspectBySlug, listProspects, salesDb } from "@/lib/sales/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Inzerce — ${slug}`,
    robots: { index: true, follow: true },
  };
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = salesDb();
  if (!db) notFound();
  const contract = await findActiveContractBySlug(db, slug);
  const prospects = await listProspects(db, 300);
  const prospect =
    (contract ? prospects.find((p) => p.id === contract.prospect_id) : null) ?? (await findProspectBySlug(db, slug));
  if (!contract || !prospect) notFound();
  const pkg = salesPackageById(contract.package_id);

  return (
    <ModulePageShell
      eyebrow="Označená inzerce"
      title={prospect.company}
      description={contract.offer_text || pkg?.tagline || "Inzertní profil partnera MedScopeGlobal."}
      ctaHref="/inzerce/pausal"
      ctaLabel="Chci také inzerovat"
    >
      <p className="mb-6 text-sm text-slate-600">
        Toto je placená inzerce tarifu {pkg?.name ?? contract.package_id}. Není to redakční doporučení lékaře.
        {prospect.website ? (
          <>
            {" "}
            Web inzerenta:{" "}
            <a className="text-[#005B96] underline" href={prospect.website} rel="noopener noreferrer sponsored">
              {prospect.website}
            </a>
          </>
        ) : null}
      </p>
      <h2 className="mb-3 font-display text-xl font-semibold">Poptat nabídku</h2>
      <InquiryForm slug={contract.landing_slug} />
    </ModulePageShell>
  );
}
