import Image from "next/image";
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

type Variant = "quiet" | "shelf";

type Props = {
  locale?: GlobalLocaleCode;
  category?: AffiliateProduct["category"];
  title?: string;
  products?: AffiliateProduct[];
  variant?: Variant;
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

export function AffiliateBox({
  locale = "cs",
  category,
  title,
  products: productsProp,
  variant = "quiet",
}: Props) {
  const products =
    productsProp ?? AFFILIATE_PRODUCTS.filter((p) => !category || p.category === category);
  const revenue = getRevenueCopy(locale);
  const heading =
    title ?? (variant === "shelf" ? revenue.affiliateShelfTitle : revenue.affiliateTitle);
  const kicker = variant === "shelf" ? revenue.affiliateShelfKicker : revenue.affiliateKicker;

  if (!products.length) return null;

  const shelf = variant === "shelf";

  return (
    <section
      className={
        shelf
          ? "my-2"
          : "my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <p
        className={
          shelf
            ? "text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]"
            : "text-[10px] font-semibold uppercase tracking-wider text-slate-500"
        }
      >
        {kicker}
      </p>
      <h3
        className={
          shelf
            ? "mt-1 font-display text-2xl font-semibold text-[#021d33]"
            : "mt-1 font-display text-lg font-semibold text-[#021d33]"
        }
      >
        {heading}
      </h3>
      <div
        className={
          shelf
            ? "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
            : "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {products.map((product) => (
          <AffiliateProductCard
            key={product.id}
            product={product}
            locale={locale}
            variant={variant}
          />
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{revenue.affiliateDisclosure}</p>
    </section>
  );
}

function AffiliateProductCard({
  product,
  locale,
  variant,
}: {
  product: AffiliateProduct;
  locale: GlobalLocaleCode;
  variant: Variant;
}) {
  const url = affiliateHref(product.id, locale, localizedField(product.affiliateUrl, locale));
  const name = localizedField(product.name, locale);
  const description = localizedField(product.description, locale);
  const chrome = getArticleChrome(locale);
  const shelf = variant === "shelf";

  if (shelf) {
    return (
      <Link
        href={url}
        rel="noopener noreferrer sponsored"
        className="group relative overflow-hidden rounded-2xl border border-[#cfe1f3] bg-[#e8f3fb] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative aspect-[3/4]">
          <Image
            src={product.imageUrl}
            alt={name}
            fill
            sizes="180px"
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#021d33]/90 via-[#021d33]/55 to-transparent px-3 pb-3 pt-12">
            <p className="font-semibold leading-snug text-white">{name}</p>
            <span className="mt-1 inline-block text-xs font-medium text-white/85 group-hover:underline">
              {chrome.moreInfo}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={url}
      rel="noopener noreferrer sponsored"
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-[#005B96]/40 hover:shadow-sm"
    >
      <div className="relative aspect-[5/4] bg-[#f4f7fb]">
        <Image
          src={product.imageUrl}
          alt={name}
          fill
          sizes="220px"
          unoptimized
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-3">
        <p className="font-semibold leading-snug text-[#021d33] group-hover:text-[#005B96]">{name}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
        <span className="mt-2 inline-block text-xs font-medium text-[#005B96] group-hover:underline">
          {chrome.moreInfo}
        </span>
      </div>
    </Link>
  );
}

export function LongevityProductsSection({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  const chrome = getArticleChrome(locale);
  return (
    <AffiliateBox
      locale={locale}
      title={chrome.recsTitle}
      variant="shelf"
      products={pickAffiliateProducts({ surface: "homepage", locale })}
    />
  );
}

export function TopLongevityProducts({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  return (
    <AffiliateBox
      locale={locale}
      variant="shelf"
      products={pickAffiliateProducts({ surface: "homepage", locale })}
    />
  );
}

/** High-visibility homepage rail — after editorial, before display ads. */
export function HomepageAffiliateShelf({ locale = "cs" }: { locale?: GlobalLocaleCode | string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="rounded-xl border border-[#cfe1f3] bg-gradient-to-b from-[#e8f3fb] via-white to-white px-5 py-6 sm:px-7">
        <TopLongevityProducts locale={locale as GlobalLocaleCode} />
      </div>
    </div>
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
      variant="quiet"
      products={pickAffiliateProducts({ surface: "listing", locale, topic })}
    />
  );
}

export function TopicAffiliateBox({
  locale = "cs",
  article,
}: {
  locale?: GlobalLocaleCode;
  article: RevenueArticle;
}) {
  const products = matchAffiliateProducts(article);
  return <AffiliateBox locale={locale} variant="quiet" products={products} />;
}

/** Two image cards after the first paragraphs — visible, not a hard sell. */
export function MidArticleAffiliate({
  locale = "cs",
  article,
}: {
  locale?: GlobalLocaleCode | string;
  article: RevenueArticle;
}) {
  const products = pickAffiliateProducts({ surface: "articleMid", locale, article });
  return <AffiliateBox locale={locale as GlobalLocaleCode} variant="quiet" products={products} />;
}
