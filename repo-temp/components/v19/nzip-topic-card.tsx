import type { NzipIndexEntry } from "@/lib/v19/nzip-index";

/** Mobile-first NZIP topic card for brief feeds and glossary hub */
export function V19NzipTopicCard({ entry }: { entry: NzipIndexEntry }) {
  const tags = [...(entry.topicTags ?? []), ...(entry.categoryTags ?? [])].slice(0, 4);

  return (
    <article className="v19-nzip-topic-card rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-white p-4 shadow-sm sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
        NZIP · {entry.category.replace(/-/g, " ")}
      </p>
      <h3 className="mt-1 font-display text-base font-semibold leading-snug text-medical-navy sm:text-lg">
        {entry.title}
      </h3>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sky-100/80 px-2 py-0.5 text-[10px] font-medium text-sky-900"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Zdroj: NZIP.cz — Národní zdravotnický informační portál
      </p>
      <a
        href={entry.url}
        rel="noopener noreferrer"
        target="_blank"
        className="mt-2 inline-block text-xs font-medium text-[#005B96] underline-offset-2 hover:underline"
      >
        Veřejná stránka NZIP
      </a>
      <p className="mt-2 text-[10px] text-muted-foreground">
        MedScope generuje pouze vlastní shrnutí — nikdy nekopíruje text.
      </p>
    </article>
  );
}

/** Compact NZIP tag chips for article cards */
export function V19NzipTagChips({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.slice(0, 5).map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-sky-200/80 px-2 py-0.5 text-[10px] text-sky-800"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
