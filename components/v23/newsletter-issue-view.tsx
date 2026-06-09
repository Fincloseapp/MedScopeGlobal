import Image from "next/image";
import Link from "next/link";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import {
  ensureLayoutImages,
  resolveNewsletterItemImage,
  sectionImageUrl,
  V23_ITEM_IMAGE_SECTIONS,
} from "@/lib/v23/newsletter/images";
import type { V23NewsletterLayout, V23NewsletterSection } from "@/lib/v23/newsletter/types";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import { formatIssueDateCs, isJsonLikeText, sanitizeNewsletterText } from "@/lib/v23/newsletter/sanitize";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";
import { Button } from "@/components/ui/button";

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

function parseLayout(issue: NewsletterRow): V23NewsletterLayout | null {
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
    headline: newsletterHeadline(issue.issue_date),
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
}: {
  item: V23NewsletterSection["items"][number];
  sectionId: string;
  sectionTitle: string;
  index: number;
}) {
  const img = resolveItemImage(sectionId, sectionTitle, item, index);

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
        {item.href ? (
          <Link href={item.href} className="font-semibold text-[#005B96] hover:underline">
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

export function V23NewsletterIssueView({ issue }: { issue: NewsletterRow }) {
  const layout = parseLayout(issue);
  const dateLabel = formatIssueDateCs(issue.issue_date);
  const heroUrl = layout?.heroImageUrl?.startsWith("http") ? layout.heroImageUrl : V23_NEWSLETTER_IMAGE;
  const heroAlt = layout?.heroImageAlt ?? "MedScopeGlobal Newsletter — odborný medicínský přehled";
  const showHtmlFallback =
    !layout && issue.html_content && !isJsonLikeText(issue.html_content) && !issue.html_content.includes('"sections"');

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[21/9] min-h-[200px] bg-slate-100 sm:aspect-[3/1]">
        <Image
          src={heroUrl}
          alt={heroAlt}
          fill
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/90 via-[#021d33]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
          <MedScopeLogo href="" preset="newsletter-hero" />
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
            MedScopeGlobal Newsletter
          </p>
          <p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{dateLabel}</p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {layout?.intro ? (
          <p className="text-base leading-relaxed text-slate-700">{layout.intro}</p>
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
          <p className="mt-6 text-slate-600">Obsah vydání bude brzy doplněn.</p>
        )}

        {layout?.recommended && layout.recommended.length > 0 ? (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
            <h2 className="font-display text-lg font-bold text-[#021d33]">Doporučujeme</h2>
            <ul className="mt-4 space-y-3">
              {layout.recommended.map((r, i) => (
                <li key={`rec-${i}`} className="text-sm text-slate-700">
                  {r.href ? (
                    <Link href={r.href} className="font-semibold text-[#005B96] hover:underline">
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

        <div className="mt-10 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 text-center">
          <h2 className="font-display text-lg font-bold text-[#021d33]">Přihlásit se k odběru</h2>
          <p className="mt-2 text-sm text-slate-600">
            Týdenní odborný přehled studií, legislativy a novinek přímo do e-mailu.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/subscribe">Přihlásit se k odběru</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-col items-center border-t border-slate-100 pt-8">
          <MedScopeLogo href="/" preset="newsletter-footer" />
          <p className="mt-3 text-center text-xs text-slate-500">
            MedScopeGlobal — odborný medicínský magazín
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/newsletter/archiv">Archiv vydání</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/newsletter">← Přehled</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
