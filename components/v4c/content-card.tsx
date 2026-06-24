import Link from "next/link";

export function V4cContentCard({
  href,
  title,
  meta,
  summary,
  badge,
}: {
  href: string;
  title: string;
  meta?: string;
  summary?: string | null;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-[#cfe1f3] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {badge ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">{badge}</span>
      ) : null}
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">{title}</h3>
      {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}
      {summary ? <p className="mt-2 text-sm text-slate-600 line-clamp-3">{summary}</p> : null}
    </Link>
  );
}
