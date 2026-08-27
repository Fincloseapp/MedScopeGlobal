import Link from "next/link";
import { SafeArticleImage } from "@/components/media/safe-article-image";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { formatArticleDateLabel } from "@/lib/editorial/freshness";
import { editorialUnitLabel, isEditorialUnitId } from "@/lib/editorial/units";
import { resolveWriterAgent } from "@/lib/editorial/writer-agents";
import { resolveDisplayCover, resolveTopicFallbackCover } from "@/lib/v271/topic-covers";
import { classifyNewsDesk, NEWS_DESKS, type NewsDeskId } from "@/lib/v271/news-desks";

function coverOf(article: DisplayArticle) {
  const src = resolveDisplayCover({
    title: article.title,
    category: article.categories?.name,
    excerpt: article.excerpt,
    coverUrl: article.cover_image_url,
    slug: article.slug,
    public_topic: article.public_topic,
  });
  const fallbackSrc = resolveTopicFallbackCover({
    title: article.title,
    category: article.categories?.name,
    excerpt: article.excerpt,
    slug: article.slug,
    public_topic: article.public_topic,
  });
  return { src, fallbackSrc };
}

function kickerOf(article: DisplayArticle): string {
  const agent = resolveWriterAgent(article);
  if (agent) return agent.topicLabel;
  const desk = NEWS_DESKS.find((item) => item.id === classifyNewsDesk(article));
  return article.categories?.name ?? desk?.label ?? "Redakce";
}

function reviewLine(article: DisplayArticle): string {
  const assignment = article.editorialAssignment;
  const reviewer =
    assignment?.reviewer && isEditorialUnitId(assignment.reviewer)
      ? editorialUnitLabel(assignment.reviewer, "cs")
      : null;
  if (reviewer) return `Nezávislá redakční kontrola: ${reviewer}`;
  return article.editorialPrimaryLabel
    ? `Redakční kontrola: ${article.editorialPrimaryLabel}`
    : "Redakční kontrola MedScopeGlobal";
}

export function NewsArticleThumb({
  article,
  large,
  sizes,
}: {
  article: DisplayArticle;
  large?: boolean;
  sizes: string;
}) {
  const { src, fallbackSrc } = coverOf(article);
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${
        large ? "aspect-[16/9] rounded-xl" : "h-16 w-24 shrink-0 rounded-md"
      }`}
    >
      <SafeArticleImage
        src={src}
        fallbackSrc={fallbackSrc}
        alt={article.title}
        className="object-cover"
        sizes={sizes}
      />
    </div>
  );
}

export function NewsHeadlineRow({ article }: { article: DisplayArticle }) {
  const date = formatArticleDateLabel(article);
  return (
    <Link href={`/article/${article.slug}`} className="group flex gap-3 py-2.5">
      <NewsArticleThumb article={article} sizes="96px" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#005B96]">
          {kickerOf(article)}
        </p>
        <h3 className="font-display text-sm font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96]">
          {article.title}
        </h3>
        {date ? <p className="mt-1 text-[11px] text-slate-500">{date.text}</p> : null}
      </div>
    </Link>
  );
}

export function NewsMagazineCard({
  article,
  featured = false,
}: {
  article: DisplayArticle;
  featured?: boolean;
}) {
  const date = formatArticleDateLabel(article);
  const { src, fallbackSrc } = coverOf(article);
  const desk = classifyNewsDesk(article);

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#005B96]/30 hover:shadow-md ${
        featured ? "lg:flex-row" : ""
      }`}
    >
      <Link
        href={`/article/${article.slug}`}
        className={`relative overflow-hidden bg-slate-100 ${
          featured ? "aspect-[16/9] lg:w-[58%] lg:aspect-auto lg:min-h-[22rem]" : "aspect-[16/10]"
        }`}
      >
        <SafeArticleImage
          src={src}
          fallbackSrc={fallbackSrc}
          alt={article.title}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes={featured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
          priority={featured}
        />
      </Link>
      <div className={`flex flex-1 flex-col p-5 ${featured ? "lg:w-[42%] lg:justify-center lg:p-8" : ""}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
          {kickerOf(article)}
        </p>
        <h2
          className={`mt-2 font-display font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96] ${
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h2>
        {article.excerpt ? (
          <p className={`mt-2 text-sm leading-6 text-slate-600 ${featured ? "line-clamp-5" : "line-clamp-3"}`}>
            {article.excerpt}
          </p>
        ) : null}
        <p className="mt-3 text-[11px] leading-5 text-slate-500">{reviewLine(article)}</p>
        {date ? (
          <p className="mt-1 text-[11px] text-slate-400">
            <time dateTime={date.dateTime}>{date.text}</time>
          </p>
        ) : null}
        <Link
          href={`/article/${article.slug}`}
          className="mt-4 inline-flex text-sm font-semibold text-[#005B96] hover:underline"
        >
          Číst článek →
        </Link>
        <span className="sr-only">Oblast {desk}</span>
      </div>
    </article>
  );
}

export function NewsDeskFallback({
  desk,
}: {
  desk: NewsDeskId;
}) {
  const def = NEWS_DESKS.find((item) => item.id === desk)!;
  return (
    <Link href={def.href} className="block py-2.5">
      <h3 className="font-display text-sm font-semibold leading-snug text-[#021d33] hover:text-[#005B96]">
        {def.label}
      </h3>
      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-600">{def.blurb}</p>
    </Link>
  );
}
