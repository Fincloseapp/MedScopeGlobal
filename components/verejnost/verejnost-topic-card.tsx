import Link from "next/link";
import { PublicModuleImage } from "@/components/verejnost/public-module-image";

export function VerejnostTopicCard({
  slug,
  label,
  description,
  href,
  count,
  latestTitle,
}: {
  slug: string;
  label: string;
  description: string;
  href: string;
  count?: number;
  latestTitle?: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#005B96]/40 hover:shadow-md"
    >
      <PublicModuleImage slug={slug} label={label} className="aspect-[16/9] w-full" />
      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-[#021d33] group-hover:text-[#005B96]">
          {label}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
        {typeof count === "number" ? (
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#005B96]">
            {count} {count === 1 ? "článek" : count < 5 ? "články" : "článků"} v rubrice
          </p>
        ) : null}
        {latestTitle ? (
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{latestTitle}</p>
        ) : null}
      </div>
    </Link>
  );
}
