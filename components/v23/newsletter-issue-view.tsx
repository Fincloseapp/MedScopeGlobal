import Image from "next/image";
import Link from "next/link";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { NewsletterHero } from "@/components/newsletter/Hero";
import { NewsletterFooterLogo } from "@/components/newsletter/Footer";
import {
  ensureLayoutImages,
  resolveNewsletterItemImage,
  sectionImageUrl,
  V23_ITEM_IMAGE_SECTIONS,
} from "@/lib/v23/newsletter/images";
import type { V23NewsletterLayout, V23NewsletterSection } from "@/lib/v23/newsletter/types";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import { isJsonLikeText, sanitizeNewsletterText } from "@/lib/v23/newsletter/sanitize";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";
import { Button } from "@/components/ui/button";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";

function resolveItemImage(
  sectionId: string,
  sectionTitle: string,
  item: V23NewsletterSection["items"][number],
  index: number
): { url: string; alt: string; isLocal: boolean } | null {
  if (!V23_ITEM_IMAGE_SECTIONS.has(sectionId)) return null;
  return resolveNewsletterItemImage({
    sectionId,
    sectionTitle,
    itemTitle: item.title,
    existingUrl: item.imageUrl,
    index,
  });
}

function resolveSectionImage(
  sectionId: string,
  sectionTitle: string,
  issueDate: string,
  existing?: string
): { url: string; alt: string } {
  const url =
    existing?.startsWith("http") ? existing : sectionImageUrl(sectionId, `${sectionId}-${issueDate}`);
  return { url, alt: `${sectionTitle} — MedScopeGlobal Newsletter` };
}

function sanitizeSection(sec: V23NewsletterSection): V23NewsletterSection {
  return {
    ...sec,
    title: sanitizeNewsletterText(sec.title, sec.title),
    intro: sanitizeNewsletterText(sec.intro, sec.intro),
    items: sec.items
      .map((item) => ({
        title: sanitizeNewsletterText(item.title),
        summary: sanitizeNewsletterText(item.summary),
        href: item.href,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
      }))
      .filter((item) => item.title.length > 2 && !isJsonLikeText(item.title)),
  };
}

function parseLayout(issue: NewsletterRow, locale = "cs"): V23NewsletterLayout | null {
  const lj = issue.layout_json;
  if (!lj || typeof lj !== "object") return null;
  const layout = lj as V23NewsletterLayout;
  if (!Array.isArray(layout.sections) || layout.sections.length < 5) return null;
  if (isJsonLikeText(layout.intro)) return null;

  const withImages = ensureLayoutImages(layout, issue.issue_date);
  const sections = withImages.sections.map(sanitizeSection).filter((s) => s.items.length > 0);
  if (!sections.length) return null;

  return {
    ...withImages,
    headline: newsletterHeadline(issue.issue_date, locale),
    intro: sanitizeNewsletterText(withImages.intro),
    sections,
    recommended: (withImages.recommended ?? [])
      .map((r) => ({
        title: sanitizeNewsletterText(r.title),
        summary: sanitizeNewsletterText(r.summary),
        href: r.href,
      }))
      .filter((r) => r.title.length > 2),
  };
}

function NewsletterItemCard({
  item,
  sectionId,
  sectionTitle,
  index,
  locale,
}: {
  item: V23NewsletterSection["items"][number];
  sectionId: string;
  sectionTitle: string;
  index: number;
  locale: string;
}) {
  const img = resolveItemImage(sectionId, sectionTitle, item, index);
  const href = item.href?.startsWith("/") ? localizePublicHref(item.href, locale) : item.href;

  return (
    <li className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:border-sky-100 hover:shadow-md">
      {img ? (
        <div className="relative aspect-[21/9] w-full bg-slate-200 sm:aspect-[16/10]">
          <Image
            src={img.url}
            alt={img.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
            loading="lazy"
            unoptimized={img.isLocal}
          />
        </div>
      ) : null}
      <div className="p-4">
        {href ? (
          <Link href={href} className="font-semibold text-[#005B96] hover:underline">
            {item.title}
          </Link>
        ) : (
          <p className="font-semibold text-[#021d33]">{item.title}</p>
        )}
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.summary}</p>
      </div>
    </li>
  );
}

export function V23NewsletterIssueView({
  issue,
  locale = "cs",
}: {
  issue: NewsletterRow;
  locale?: string;
}) {
  const layout = parseLayout(issue, locale);
  const copy = getNewsletterCopy(locale);
  const dateLabel = formatPublicDate(issue.issue_date, locale);
  const primary = primaryArticleLocale(normalizeLocale(locale));
  const recommendedLabel =
    primary === "cs" ? "Doporučujeme" : primary === "de" ? "Empfohlen" : primary === "fr" ? "À lire" : "Worth a look";
  const emptyLabel =
    primary === "cs"
      ? "Obsah vydání bude brzy doplněn."
      : primary === "de"
        ? "Diese Ausgabe wird in Kürze ergänzt."
        : primary === "fr"
          ? "Ce numéro sera bientôt complété."
          : "This issue will be filled in shortly.";
  const czechBody = primary !== "cs";
  const languageNote =
    primary === "de"
      ? "Diese medizinische Ausgabe erscheint auf Tschechisch. Der ViaLongeVita-Brief in Ihrem Postfach kommt in Ihrer Sprache."
      : primary === "fr"
        ? "Ce digest médical est publié en tchèque. Le brief ViaLongeVita arrive dans votre langue."
        : primary === "cs"
          ? null
          : "This medical digest is published in Czech. The ViaLongeVita brief in your inbox is in your language.";
  const subhead =
    layout?.intro && !(czechBody && looksLikeCzech(layout.intro))
      ? layout.intro
      : `${copy.hubDescription}${dateLabel ? ` — ${dateLabel}` : ""}`;
  const heroUrl = layout?.heroImageUrl?.startsWith("http") ? layout.heroImageUrl : V23_NEWSLETTER_IMAGE;
  const heroAlt = layout?.heroImageAlt ?? copy.hubTitle;
  const showHtmlFallback =
    !layout && issue.html_content && !isJsonLikeText(issue.html_content) && !issue.html_content.includes('"sections"');

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative min-h-[360px] bg-[#021d33] sm:min-h-[400px]">
        <Image
          src={heroUrl}
          alt={heroAlt}
          fill
          className="object-cover opacity-35"
          sizes="(max-width: 896px) 100vw, 896px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#021d33]/80 via-[#021d33]/88 to-[#021d33]/95" />
        <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[400px]">
          <NewsletterHero
            title={layout?.headline ?? `MedScopeGlobal Newsletter — ${dateLabel}`}
            subhead={subhead}
            className="w-full text-white"
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {languageNote ? (
          <p className="rounded-xl border border-[#cfe1f3] bg-[#e8f3fb] px-4 py-3 text-sm text-[#021d33]">
            {languageNote}
          </p>
        ) : null}
        {layout?.sections?.length ? (
          <div className="mt-8 space-y-10">
            {layout.sections.map((sec) => {
              const secImg = resolveSectionImage(sec.id, sec.title, issue.issue_date, sec.imageUrl);
              return (
                <section key={`${sec.id}-${sec.title}`} className="scroll-mt-24" id={`nl-${sec.id}`}>
                  <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={secImg.url}
                      alt={secImg.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 896px) 100vw, 800px"
                      loading="lazy"
                    />
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#021d33] sm:text-2xl">{sec.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{sec.intro}</p>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-1">
                    {sec.items.map((item, i) => (
                      <NewsletterItemCard
                        key={`${sec.id}-${i}`}
                        item={item}
                        sectionId={sec.id}
                        sectionTitle={sec.title}
                        index={i}
                        locale={locale}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : showHtmlFallback ? (
          <div
            className="prose prose-slate mt-6 max-w-none prose-headings:font-display prose-headings:text-[#021d33]"
            dangerouslySetInnerHTML={{ __html: issue.html_content! }}
          />
        ) : (
          <p className="mt-6 text-slate-600">{emptyLabel}</p>
        )}

        {layout?.recommended && layout.recommended.length > 0 ? (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
            <h2 className="font-display text-lg font-bold text-[#021d33]">{recommendedLabel}</h2>
            <ul className="mt-4 space-y-3">
              {layout.recommended.map((r, i) => (
                <li key={`rec-${i}`} className="text-sm text-slate-700">
                  {r.href ? (
                    <Link
                      href={r.href.startsWith("/") ? localizePublicHref(r.href, locale) : r.href}
                      className="font-semibold text-[#005B96] hover:underline"
                    >
                      {r.title}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#021d33]">{r.title}</span>
                  )}
                  <span className="text-slate-600"> — {r.summary}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-10 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6">
          <NewsletterCapture locale={locale} source="newsletter-issue-v23" />
        </div>

        <div className="mt-10 flex flex-col items-center border-t border-slate-100 pt-8">
          <NewsletterFooterLogo href={localizePublicHref("/", locale)} />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={localizePublicHref("/newsletter/archiv", locale)}>{copy.hubArchive}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={localizePublicHref("/newsletter", locale)}>← {copy.hubTitle}</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
