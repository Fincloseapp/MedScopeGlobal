import Link from "next/link";
import type { EngineItem } from "@/lib/content-engine/ai-content";

export function EngineCard({ item }: { item: EngineItem }) {
  const external = /^https?:\/\//.test(item.href);

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#005B96]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
          {item.badge}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-600">
          {item.source}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold text-[#021d33]">{item.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{item.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#f1f8ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#e4edf6] pt-3 text-xs text-slate-500">
        <span>{item.readTime}</span>
        <span className="font-semibold text-[#005B96]">
          {external ? "Otevřít zdroj →" : "Číst více →"}
        </span>
      </div>
    </>
  );

  if (external) {
    return (
      <article className="rounded-[28px] border border-[#dfeaf5] bg-white p-5 shadow-[0_18px_46px_-28px_rgba(0,91,150,0.7)]">
        <a href={item.href} target="_blank" rel="noreferrer" className="block">
          {content}
        </a>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-[#dfeaf5] bg-white p-5 shadow-[0_18px_46px_-28px_rgba(0,91,150,0.7)]">
      <Link href={item.href} className="block">
        {content}
      </Link>
    </article>
  );
}
