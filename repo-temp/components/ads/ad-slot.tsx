import Image from "next/image";
import Link from "next/link";
import type { AdRow } from "@/types/database";

export function AdSlot({ ads }: { ads: AdRow[] }) {
  if (ads.length === 0) return null;

  return (
    <aside className="lg:sticky lg:top-6 space-y-3">
      <div className="rounded-[28px] border border-[#C7E3FF]/80 bg-[#f8fcff] p-4 shadow-[0_14px_40px_-28px_rgba(0,91,150,0.7)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              Partner spotlight
            </p>
            <p className="mt-2 text-sm font-semibold text-medical-navy">
              Curated medical partners and learning resources
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {ads.map((ad) => (
          <Link
            key={ad.id}
            href={ad.link_url || "#"}
            target={ad.link_url ? "_blank" : undefined}
            rel={ad.link_url ? "noopener noreferrer" : undefined}
            className="group block overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(2,30,57,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-32px_rgba(0,91,150,0.72)]"
          >
            <div className="relative aspect-[4/3] w-full bg-slate-100">
              <Image
                src={ad.image_url}
                alt={ad.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                  partner feature
                </p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-slate-900">{ad.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">External partner • curated for clinical learning</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
