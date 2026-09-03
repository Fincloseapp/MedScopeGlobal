import { MEDSCOPE_LOGO } from "@/lib/brand/logo";
import { SITE } from "@/lib/config/site";
import { pickAffiliateProducts } from "@/lib/monetization/affiliate-mix";
import { affiliateGoPath } from "@/lib/monetization/affiliate-geo";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderNewsletterHtml(layout: V23NewsletterLayout, locale = "cs"): string {
  const sectionsHtml = layout.sections
    .map((sec) => {
      const items = sec.items
        .map((item) => {
          const title = escapeHtml(item.title);
          const summary = escapeHtml(item.summary);
          const thumb = item.imageUrl
            ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.imageAlt ?? item.title)}" loading="lazy" width="120" height="80" class="nl-item-img" />`
            : "";
          const body = item.href
            ? `<a href="${escapeHtml(item.href)}"><strong>${title}</strong></a><p>${summary}</p>`
            : `<strong>${title}</strong><p>${summary}</p>`;
          return `<li class="nl-item">${thumb}<div class="nl-item-body">${body}</div></li>`;
        })
        .join("");
      return `
<section class="nl-section" data-section="${escapeHtml(sec.id)}">
  <figure class="nl-figure">
    <img src="${escapeHtml(sec.imageUrl)}" alt="${escapeHtml(sec.imageAlt)}" loading="lazy" width="800" height="450" />
  </figure>
  <h2>${escapeHtml(sec.title)}</h2>
  <p class="nl-section-intro">${escapeHtml(sec.intro)}</p>
  <ul class="nl-list">${items}</ul>
</section>`;
    })
    .join("\n");

  const recHtml = layout.recommended
    .map((r) => `<li><strong>${escapeHtml(r.title)}</strong> — ${escapeHtml(r.summary)}</li>`)
    .join("");

  const copy = getNewsletterCopy(locale);
  const affiliateHtml = pickAffiliateProducts({ surface: "newsletter", locale })
    .map((product) => {
      const name = product.name[locale] ?? product.name.en ?? product.name.cs ?? product.id;
      const href = `${SITE.url}${affiliateGoPath(product.id, locale, { carryLocale: true })}`;
      const image = product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `${SITE.url}${product.imageUrl}`;
      const description =
        product.description[locale] ?? product.description.en ?? product.description.cs ?? "";
      return `<li class="nl-item"><img src="${escapeHtml(image)}" alt="" width="120" height="150" class="nl-item-img" /><div class="nl-item-body"><a href="${escapeHtml(href)}"><strong>${escapeHtml(name)}</strong></a><p>${escapeHtml(description)}</p></div></li>`;
    })
    .join("");

  return `
<article class="v23-newsletter-html">
  <header class="nl-brand"><img src="${MEDSCOPE_LOGO.print}" alt="MedScopeGlobal" width="180" height="44" /></header>
  <p class="nl-lead">${escapeHtml(layout.intro)}</p>
  ${sectionsHtml}
  <section class="nl-section nl-cta">
    <h2>${escapeHtml(copy.hubLatest)}</h2>
    <ul>${recHtml}</ul>
    <p><a href="/newsletter" class="nl-cta-link">${escapeHtml(copy.cta)} →</a></p>
  </section>
  <section class="nl-section">
    <h2>${escapeHtml(copy.briefAffiliateKicker)}</h2>
    <ul class="nl-list">${affiliateHtml}</ul>
  </section>
</article>`;
}

export function renderNewsletterPdfText(layout: V23NewsletterLayout, locale = "cs"): string {
  const copy = getNewsletterCopy(layout.locale ?? locale);
  const lines = [layout.headline, "", layout.intro, ""];
  for (const s of layout.sections) {
    lines.push(`## ${s.title}`, s.intro, "");
    for (const item of s.items) {
      lines.push(`- ${item.title}: ${item.summary}`);
    }
    lines.push("");
  }
  lines.push(`${copy.cta}: https://www.medscopeglobal.com/newsletter`);
  return lines.join("\n");
}
