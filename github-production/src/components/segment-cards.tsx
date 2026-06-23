import Link from "next/link";
import { audienceSegments } from "@/lib/audience-segments";

export function SegmentCards() {
  return (
    <div className="segment-grid grid">
      {audienceSegments.map((segment) => (
        <article key={segment.slug} className="card segment-card">
          <h3>{segment.title}</h3>
          <p>{segment.summary}</p>
          <Link className="button primary" href={`/pro-koho/${segment.slug}`}>
            {segment.profileCta}
          </Link>
        </article>
      ))}
    </div>
  );
}
