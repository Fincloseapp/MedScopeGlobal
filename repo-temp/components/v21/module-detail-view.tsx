import Link from "next/link";
import { PublicModuleImage } from "@/components/v25/public-module-image";
import { ExternalLink, Calendar } from "lucide-react";
import type { V21ModuleSection } from "@/lib/v21/enrich";

export function V21ModuleDetailView({
  backHref,
  backLabel,
  eyebrow,
  title,
  subtitle,
  dateLabel,
  imageUrl,
  sections,
  source,
  sourceUrl,
  badge,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  dateLabel?: string;
  imageUrl: string;
  sections: V21ModuleSection[];
  source?: string;
  sourceUrl?: string | null;
  badge?: string;
}) {
  return (
    <article className="v21-module-detail mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href={backHref} className="text-sm font-medium text-primary hover:underline">
        ← {backLabel}
      </Link>

      <header className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#021d33] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-lg text-slate-600">{subtitle}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          {badge ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {badge}
            </span>
          ) : null}
          {dateLabel ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {dateLabel}
            </span>
          ) : null}
          {source ? <span>Zdroj: {source}</span> : null}
        </div>
      </header>

      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
        <PublicModuleImage src={imageUrl} alt={title} priority />
      </div>

      <div className="mt-8 space-y-8">
        {sections.map((sec) => (
          <section key={sec.title}>
            <h2 className="font-display text-xl font-semibold text-[#021d33]">{sec.title}</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{sec.body}</p>
          </section>
        ))}
      </div>

      {sourceUrl ? (
        <p className="mt-8">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Otevřít primární zdroj <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>
      ) : null}
    </article>
  );
}
