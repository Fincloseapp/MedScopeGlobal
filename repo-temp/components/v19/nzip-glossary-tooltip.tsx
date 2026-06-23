"use client";

/** NZIP glossary term with hover tooltip (mobile: tap-friendly title) */
export function V19NzipGlossaryTooltip({
  term,
  locale = "cs",
}: {
  term: string;
  locale?: string;
}) {
  const hint =
    locale === "cs"
      ? `Pojem z NZIP.cz — informativní kontext, není lékařská rada.`
      : `Term from NZIP.cz — informational context, not medical advice.`;

  return (
    <abbr
      title={hint}
      className="cursor-help border-b border-dotted border-sky-400 font-medium text-sky-900"
    >
      {term}
    </abbr>
  );
}

export function V19NzipEducationalLinks({
  links,
  locale = "cs",
}: {
  links: { label: string; url: string; type?: string }[];
  locale?: string;
}) {
  if (!links.length) return null;
  return (
    <div className="mt-3 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        {locale === "cs" ? "NZIP edukační odkazy" : "NZIP educational links"}
      </p>
      <ul className="space-y-1 text-sm">
        {links.slice(0, 5).map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-[#005B96] underline-offset-2 hover:underline"
            >
              {link.label}
            </a>
            {link.type && (
              <span className="ml-1 text-[10px] text-muted-foreground">({link.type})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
