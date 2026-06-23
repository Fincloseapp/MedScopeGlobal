import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { audienceSegments, getAudienceSegment } from "@/lib/audience-segments";

type Props = { params: Promise<{ segment: string }> };

export function generateStaticParams() {
  return audienceSegments.map((segment) => ({ segment: segment.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment: slug } = await params;
  const segment = getAudienceSegment(slug);
  if (!segment) return { title: "Profil nenalezen" };
  return {
    title: segment.title,
    description: segment.summary,
    alternates: { canonical: `/pro-koho/${segment.slug}` }
  };
}

export default async function ProKohoSegmentPage({ params }: Props) {
  const { segment: slug } = await params;
  const segment = getAudienceSegment(slug);
  if (!segment) notFound();

  return (
    <main className="section">
      <Breadcrumbs
        items={[
          { label: "Domů", href: "/" },
          { label: "Pro koho", href: "/pro-koho" },
          { label: segment.title }
        ]}
      />
      <p className="eyebrow">Profil čtenáře</p>
      <h1>{segment.title}</h1>
      <p className="lead">{segment.summary}</p>
      <ul className="highlights">
        {segment.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <div className="hero-actions">
        <Link className="button primary" href={segment.articleFilter}>
          Procházet články
        </Link>
        <Link className="button" href={segment.ctaHref}>
          {segment.ctaLabel}
        </Link>
        <Link className="button" href="/auth/register">
          Registrace
        </Link>
      </div>
    </main>
  );
}
