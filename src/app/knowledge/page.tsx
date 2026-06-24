import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TierBadge } from "@/components/premium-gate";
import { knowledgeProducts } from "@/lib/knowledge-products";

export const metadata: Metadata = {
  title: "Knowledge produkty",
  description: "Reporty, kolekce, digesty a whitepapers pro odborníky a instituce.",
  alternates: { canonical: "/knowledge" }
};

export default function KnowledgePage() {
  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "Knowledge produkty" }]} />
      <p className="eyebrow">Knowledge products</p>
      <h1>Reporty, kolekce a tematické publikace</h1>
      <p className="lead">
        Připraveno pro reprints, sponsored special reports a downloadable knowledge packs. Tier gating respektuje
        freemium model platformy.
      </p>
      <div className="grid">
        {knowledgeProducts.map((product) => (
          <article className="card" key={product.id}>
            <div className="meta">
              <TierBadge tier={product.tier} />
              <span className="tag">{product.type}</span>
              {product.sponsored ? <span className="tag sponsored">Sponzorováno</span> : null}
            </div>
            <h2>{product.title}</h2>
            <p>{product.summary}</p>
            <div className="meta">
              <span>{product.specialization}</span>
            </div>
            <Link className="button" href={product.href}>
              Zobrazit
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
