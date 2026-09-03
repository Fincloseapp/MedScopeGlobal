import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getArticleCoverLabel, getArticleCoverStyles } from "@/lib/utils/article-visuals";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { listingByline } from "@/lib/editorial/units";
import type { ArticleWithRelations } from "@/types/database";
import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ArticleCard({
  article,
  locale,
}: {
  article: DisplayArticle | ArticleWithRelations;
  locale?: string;
}) {
  const cat = article.categories;
  const editorialLocale =
    locale ??
    ("displayLocale" in article && article.displayLocale
      ? article.displayLocale
      : article.locale ?? "cs");
  const authorLabel = listingByline(article, editorialLocale);
  const href = localizePublicHref(`/article/${article.slug}`, editorialLocale);
  const date = formatPublicDate(article.published_at, editorialLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const coverMeta = getArticleCoverLabel(article.title, cat?.name);
  const coverStyles = getArticleCoverStyles(article.title, cat?.name);
  const coverUrl = resolveArticleCoverUrl({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: cat?.name,
    publicTopic: article.public_topic,
    coverImageUrl: article.cover_image_url,
    preferCurated: true,
  });

  return (
    <Card className="group overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/95 shadow-[0_16px_50px_-28px_rgba(2,30,57,0.55)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_70px_-28px_rgba(0,91,150,0.6)]">
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
          {coverUrl ? (
            <>
              <Image
                src={coverUrl}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
                sizes="(max-width:768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={coverStyles}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
              <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                    {cat?.name ?? "Medical briefing"}
                  </span>
                  {article.vip_only && (
                    <Badge className="bg-[#005B96]/90 text-[10px] text-white" variant="vip">
                      VIP
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Evidence-based summary
                  </p>
                  <p className="max-w-[18rem] text-xl font-semibold leading-tight text-white">
                    {coverMeta.shortTitle}
                  </p>
                </div>
              </div>
            </div>
          )}
          {coverUrl && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full border border-white/20 bg-slate-950/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                {cat?.name ?? "Medical briefing"}
              </span>
            </div>
          )}
          {article.vip_only && coverUrl && (
            <Badge className="absolute right-3 top-3 bg-[#005B96]/90 text-[10px] text-white" variant="vip">
              VIP
            </Badge>
          )}
        </div>
        <CardContent className="pt-5">
          {cat && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              {cat.name}
            </p>
          )}
          <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-medical-navy">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {article.excerpt}
            </p>
          )}
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/90 px-5 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-slate-700 line-clamp-1">{authorLabel}</span>
        {date && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-medium text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
