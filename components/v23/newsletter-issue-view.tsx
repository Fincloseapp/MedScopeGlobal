import Image from "next/image";
import Link from "next/link";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { NewsletterHero } from "@/components/newsletter/Hero";
import { NewsletterFooterLogo } from "@/components/newsletter/Footer";
import {
  ensureLayoutImages,
  resolveNewsletterItemImage,
  sectionImageUrl,
} from "@/lib/v23/newsletter/images";
import type { V23NewsletterLayout, V23NewsletterSection } from "@/lib/v23/newsletter/types";
import { MagazineTitleSpread } from "@/components/magazine/magazine-title-spread";
import { pickEditionCover } from "@/lib/brand/edition-covers";
import { isUsableNewsletterImage, remapNewsletterHtmlImages } from "@/lib/v23/newsletter/topic-covers";
import { EditorialPayButtons } from "@/components/subscription/editorial-pay-buttons";
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
import { MAGAZINE } from "@/lib/brand/magazine";

function resolveItemImage(
  sectionId: string,
  sectionTitle: string,
  item: V23NewsletterSection["items"][number],
  index: number
): { url: string; alt: string; isLocal: boolean } {
  return resolveNewsletterItemImage({
    sectionId,
    sectionTitle,
    itemTitle: item.title,
    excerpt: item.summary,
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
  const url = isUsableNewsletterImage(existing)
    ? existing!
    : sectionImageUrl(sectionId, `${sectionId}-${issueDate}`);
  return { url, alt: `${sectionTitle} — ${MAGAZINE.name}` };
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
        imageUrl: r.imageUrl,
        imageAlt: r.imageAlt,
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
      <div className="relative aspect-[16/10] w-full bg-slate-100">
        <Image
          src={img.url}
          alt={img.alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 360px"
          loading="lazy"
          unoptimized={img.isLocal}
        />
      </div>
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
  headingLevel = "h1",
}: {
  issue: NewsletterRow;
  locale?: string;
  headingLevel?: "h1" | "h2";
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
  const showHtmlFallback =
    !layout && issue.html_content && !isJsonLikeText(issue.html_content) && !issue.html_content.includes('"sections"');

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MagazineTitleSpread cover={pickEditionCover(locale, issue.issue_date)} locale={locale} full />
      <NewsletterHero
        title={layout?.headline ?? `${MAGAZINE.name} · ${dateLabel}`}
        subhead={subhead}
        href={localizePublicHref("/", locale)}
        className="w-full text-[#021d33]"
        showLockup={false}
        headingLevel={headingLevel}
      />

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
                      unoptimized={secImg.url.startsWith("/assets/")}
                    />
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#021d33] sm:text-2xl">{sec.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{sec.intro}</p>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
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
            dangerouslySetInnerHTML={{ __html: remapNewsletterHtmlImages(issue.html_content!) }}
          />
        ) : (
          <p className="mt-6 text-slate-600">{emptyLabel}</p>
        )}

        {layout?.recommended && layout.recommended.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-lg font-bold text-[#021d33]">{recommendedLabel}</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {layout.recommended.map((r, i) => (
                <NewsletterItemCard
                  key={`rec-${i}`}
                  item={r}
                  sectionId="doporucujeme"
                  sectionTitle={recommendedLabel}
                  index={i}
                  locale={locale}
                />
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-10 rounded-2xl border border-[#0b1f3a] bg-[#050b1d] p-6 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
            {copy.hubEyebrow}
          </p>
          <p className="mt-2 text-sm text-slate-300">{copy.hubDescription}</p>
          <EditorialPayButtons
            locale={locale}
            className="mt-4 flex w-full max-w-sm flex-col gap-2"
            returnPath={localizePublicHref("/articles", locale)}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6">
          <NewsletterCapture locale={locale} source="newsletter-issue-v23" />
        </div>

        <div className="mt-10 flex flex-col items-center border-t border-slate-100 pt-8">
          <NewsletterFooterLogo href={localizePublicHref("/", locale)} caption={copy.footer} />
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
