import Image from "next/image";
import Link from "next/link";
import type { AffiliateProduct } from "@/lib/ecosystem/monetization";
import { getAffiliateStripProducts } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  locale?: GlobalLocaleCode;
  /** Max products to show (default 6). */
  limit?: number;
  /** Compact vertical list for article sidebar. */
  variant?: "rail" | "section";
  title?: string;
  products?: AffiliateProduct[];
};

function localizedField(record: Record<string, string>, locale: string): string {
  return record[locale] ?? record.en ?? record.cs ?? Object.values(record)[0] ?? "";
}

/**
 * Light affiliate surface for monetization (apps hub, article sidebar).
 * Avoids PortalHome — keep homepage redesign free of affiliate chrome.
 */
export function AffiliateStrip({
  locale = "cs",
  limit = 6,
  variant = "section",
  title,
  products,
}: Props) {
  const list = products ?? getAffiliateStripProducts(limit);
  if (!list.length) return null;

  const heading =
    title ??
    (locale === "cs" ? "Doporučené produkty" : "Recommended products");
  const eyebrow = locale === "cs" ? "Affiliate · Partnerství" : "Affiliate · Partners";
  const cta = locale === "cs" ? "Porovnat →" : "Compare →";

  if (variant === "rail") {
    return (
      <aside className="rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/90 to-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">{eyebrow}</p>
        <h3 className="mt-1 font-display text-base font-semibold text-[#021d33]">{heading}</h3>
        <ul className="mt-3 space-y-2">
          {list.map((product) => {
            const href = localizedField(product.affiliateUrl, locale);
            const name = localizedField(product.name, locale);
            return (
              <li key={product.id}>
                <Link
                  href={href}
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 rounded-lg px-1 py-1.5 transition hover:bg-emerald-50"
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-emerald-100">
                    <Image src={product.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#021d33]">{name}</span>
                    <span className="text-[11px] text-emerald-700">{cta}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }

  return (
    <section className="border-t border-slate-200 bg-[#f4f7fa]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-[#021d33] sm:text-3xl">{heading}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          {locale === "cs"
            ? "Kurátorovaný katalog longevity a wellness — odkazy vedou přes sledované /go přesměrování."
            : "Curated longevity and wellness picks — links use tracked /go redirects."}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => {
            const href = localizedField(product.affiliateUrl, locale);
            const name = localizedField(product.name, locale);
            const description = localizedField(product.description, locale);
            return (
              <Link
                key={product.id}
                href={href}
                rel="noopener noreferrer sponsored"
                className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-emerald-300 hover:shadow-sm"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                  <Image src={product.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-[#021d33] group-hover:text-emerald-800">{name}</span>
                  <span className="mt-0.5 block text-xs text-slate-600">{description}</span>
                  <span className="mt-1 inline-block text-xs font-medium text-emerald-700">{cta}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
