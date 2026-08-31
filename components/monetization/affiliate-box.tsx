import Link from "next/link";
import type { AffiliateProduct } from "@/lib/ecosystem/monetization";
import { AFFILIATE_PRODUCTS } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getArticleChrome } from "@/lib/i18n/article-chrome";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

type Props = {
  locale?: GlobalLocaleCode;
  category?: AffiliateProduct["category"];
  title?: string;
};

function localizedField(record: Record<string, string>, locale: string): string {
  if (record[locale]) return record[locale];
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (record[primary]) return record[primary];
  if (primary === "cs") return record.cs ?? Object.values(record)[0] ?? "";
  return record.en ?? record["en-US"] ?? "";
}

export function AffiliateBox({ locale = "cs", category, title }: Props) {
  const products = AFFILIATE_PRODUCTS.filter((p) => !category || p.category === category);
  const chrome = getArticleChrome(locale);
  const heading = title ?? chrome.recsTitle;

  if (!products.length) return null;

  return (
    <section className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        {chrome.sponsored}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">{heading}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <AffiliateProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function AffiliateProductCard({ product, locale }: { product: AffiliateProduct; locale: GlobalLocaleCode }) {
  const url = localizedField(product.affiliateUrl, locale);
  const name = localizedField(product.name, locale);
  const description = localizedField(product.description, locale);
  const chrome = getArticleChrome(locale);

  return (
    <Link
      href={url}
      target="_blank"
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
      category="longevity"
      title={chrome.recsTitle}
    />
  );
}

/** Fallback: show all supplement + sleep products for longevity section */
export function TopLongevityProducts({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  const chrome = getArticleChrome(locale);
  const products = AFFILIATE_PRODUCTS.filter(
    (p) => p.category === "supplements" || p.category === "sleep" || p.category === "lab-tests"
  );

  return (
    <section className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        {chrome.recsKicker}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">
        {chrome.recsTitle}
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <AffiliateProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
