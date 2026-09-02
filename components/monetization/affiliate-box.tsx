import Link from "next/link";
import type { AffiliateProduct } from "@/lib/ecosystem/monetization";
import { AFFILIATE_PRODUCTS } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getArticleChrome } from "@/lib/i18n/article-chrome";
import { getRevenueCopy } from "@/lib/i18n/revenue-copy";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import {
  matchAffiliateProducts,
  type RevenueArticle,
} from "@/lib/monetization/revenue-mix";
import { affiliateGoPath } from "@/lib/monetization/affiliate-geo";
import { pickAffiliateProducts } from "@/lib/monetization/affiliate-mix";

type Props = {
  locale?: GlobalLocaleCode;
  category?: AffiliateProduct["category"];
  title?: string;
  products?: AffiliateProduct[];
};

function localizedField(record: Record<string, string>, locale: string): string {
  if (record[locale]) return record[locale];
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (record[primary]) return record[primary];
  if (primary === "cs") return record.cs ?? Object.values(record)[0] ?? "";
  return record.en ?? record["en-US"] ?? "";
}

function affiliateHref(productId: string, locale: string, fallbackUrl?: string): string {
  if (productId) return affiliateGoPath(productId, locale);
  if (!fallbackUrl) return "#";
  try {
    const parsed = new URL(fallbackUrl, "https://medscopeglobal.com");
    if (parsed.pathname.startsWith("/go/")) {
      return `${parsed.pathname}${parsed.search || `?locale=${encodeURIComponent(locale)}`}`;
    }
  } catch {
    /* keep original */
  }
  return fallbackUrl;
}

export function AffiliateBox({ locale = "cs", category, title, products: productsProp }: Props) {
  const products =
    productsProp ?? AFFILIATE_PRODUCTS.filter((p) => !category || p.category === category);
  const revenue = getRevenueCopy(locale);
  const heading = title ?? revenue.affiliateTitle;

  if (!products.length) return null;

  return (
    <section className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        {revenue.affiliateKicker}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">{heading}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <AffiliateProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{revenue.affiliateDisclosure}</p>
    </section>
  );
}

function AffiliateProductCard({
  product,
  locale,
}: {
  product: AffiliateProduct;
  locale: GlobalLocaleCode;
}) {
  const url = affiliateHref(product.id, locale, localizedField(product.affiliateUrl, locale));
  const name = localizedField(product.name, locale);
  const description = localizedField(product.description, locale);
  const chrome = getArticleChrome(locale);

  return (
    <Link
      href={url}
      rel="noopener noreferrer sponsored"
      className="group rounded-xl border border-emerald-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <p className="font-semibold text-[#021d33] group-hover:text-emerald-700">{name}</p>
      <p className="mt-1 text-xs text-slate-600">{description}</p>
      <span className="mt-2 inline-block text-xs font-medium text-emerald-600 group-hover:underline">
        {chrome.moreInfo}
      </span>
    </Link>
  );
}

export function LongevityProductsSection({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  const chrome = getArticleChrome(locale);
  return (
    <AffiliateBox
      locale={locale}
      title={chrome.recsTitle}
      products={pickAffiliateProducts({ surface: "homepage", locale })}
    />
  );
}

/** Rotating mix for homepage / magazine rails — never the full catalogue. */
export function TopLongevityProducts({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  return (
    <AffiliateBox
      locale={locale}
      products={pickAffiliateProducts({ surface: "homepage", locale })}
    />
  );
}

export function ListingAffiliateBox({
  locale = "cs",
  topic,
}: {
  locale?: GlobalLocaleCode | string;
  topic?: string | null;
}) {
  return (
    <AffiliateBox
      locale={locale as GlobalLocaleCode}
      products={pickAffiliateProducts({ surface: "listing", locale, topic })}
    />
  );
}

/** Topic-matched affiliate — at most two products for the article. */
export function TopicAffiliateBox({
  locale = "cs",
  article,
}: {
  locale?: GlobalLocaleCode;
  article: RevenueArticle;
}) {
  const products = matchAffiliateProducts(article);
  return <AffiliateBox locale={locale} products={products} />;
}
