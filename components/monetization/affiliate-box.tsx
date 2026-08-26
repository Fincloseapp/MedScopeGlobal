import Link from "next/link";
import type { AffiliateProduct } from "@/lib/ecosystem/monetization";
import { AFFILIATE_PRODUCTS } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  locale?: GlobalLocaleCode;
  category?: AffiliateProduct["category"];
  title?: string;
};

function localizedField(record: Record<string, string>, locale: string): string {
  return record[locale] ?? record["en"] ?? record["cs"] ?? Object.values(record)[0] ?? "";
}

export function AffiliateBox({ locale = "cs", category, title = "Doporučené produkty" }: Props) {
  const products = AFFILIATE_PRODUCTS.filter((p) => !category || p.category === category);

  if (!products.length) return null;

  return (
    <section className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        Affiliate · Sponzorováno
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">{title}</h3>
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
        Více informací →
      </span>
    </Link>
  );
}

export function LongevityProductsSection({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  return (
    <AffiliateBox
      locale={locale}
      category="longevity"
      title="Top produkty pro dlouhověkost"
    />
  );
}

/** Fallback: show all supplement + sleep products for longevity section */
export function TopLongevityProducts({ locale = "cs" }: { locale?: GlobalLocaleCode }) {
  const products = AFFILIATE_PRODUCTS.filter(
    (p) => p.category === "supplements" || p.category === "sleep" || p.category === "lab-tests"
  );

  return (
    <section className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        Doporučené · Affiliate
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">
        Top produkty pro dlouhověkost
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <AffiliateProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
