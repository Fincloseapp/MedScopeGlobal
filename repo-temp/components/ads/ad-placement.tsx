import Image from "next/image";
import Link from "next/link";
import type { AdRow } from "@/types/database";

type Variant = "banner" | "sidebar" | "inline" | "compact";

export function AdPlacement({
  ads,
  variant = "banner",
  label = "Sponzorováno",
}: {
  ads: AdRow[];
  variant?: Variant;
  label?: string;
}) {
  if (ads.length === 0) return null;

  if (variant === "sidebar") {
    return (
      <aside className="space-y-3" aria-label={label}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} compact />
        ))}
      </aside>
    );
  }

  if (variant === "inline" || variant === "compact") {
    const ad = ads[0];
    return (
      <div
        className="my-6 rounded-2xl border border-dashed border-[#8dc4ea]/80 bg-[#f8fcff] p-4"
        aria-label={label}
      >
        <AdCard ad={ad} compact={variant === "compact"} />
      </div>
    );
  }

  const ad = ads[0];
  return (
    <section className="my-8" aria-label={label}>
      <AdCard ad={ad} wide />
    </section>
  );
}

function AdCard({ ad, compact, wide }: { ad: AdRow; compact?: boolean; wide?: boolean }) {
  const href = ad.target_url || ad.link_url || "#";
  const title = ad.title || ad.company || "Partner";

  return (
    <Link
      href={href}
      target={href !== "#" ? "_blank" : undefined}
      rel={href !== "#" ? "noopener noreferrer sponsored" : undefined}
      className={`group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${
        wide ? "w-full" : ""
      }`}
    >
      <div className={`relative w-full bg-slate-100 ${compact ? "aspect-[3/1]" : "aspect-[5/1]"}`}>
        <Image src={ad.image_url} alt={title} fill className="object-cover" sizes="(max-width:768px) 100vw, 900px" />
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
          Sponzorováno
        </span>
      </div>
      {(ad.ad_text || !compact) && (
        <div className="p-3">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {ad.ad_text ? <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ad.ad_text}</p> : null}
        </div>
      )}
    </Link>
  );
}
