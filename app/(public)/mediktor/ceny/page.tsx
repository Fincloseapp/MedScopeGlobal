import type { Metadata } from "next";
import Link from "next/link";
import { Check, HelpCircle, X } from "lucide-react";
import { V27CheckoutButton } from "@/components/v27/checkout-button";
import { MediktorMark } from "@/components/lekari/mediktor-mark";
import { AppBrandVisual } from "@/components/apps/app-brand-visual";
import { Button } from "@/components/ui/button";
import { MEDIKTOR_APP } from "@/lib/apps/catalog";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { MEDIKTOR_PRICING } from "@/lib/lekari/dokumentace/pricing-content";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { formatLegalEntityLine, getLegalEntity } from "@/lib/config/legal-entity";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: MEDIKTOR_PRICING.seoTitle,
    description: MEDIKTOR_PRICING.seoDescription,
    path: MEDIKTOR_PRICING.path,
  });
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Ano" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-slate-300" aria-label="Ne" />;
  }
  return <span className="text-xs font-medium text-slate-600">{value}</span>;
}

export default function MediktorCenyPage() {
  const p = MEDIKTOR_PRICING;
  const legalEntity = getLegalEntity();

  return (
    <div className="bg-[#fafcff]">
      <section className="relative overflow-hidden border-b border-[#d9e8f4]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,91,150,0.18),transparent_50%),linear-gradient(165deg,#021d33_0%,#005B96_55%,#0a7ab8_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <nav className="text-sm text-sky-200/90" aria-label="Drobečková navigace">
            <Link href="/" className="hover:text-white">
              Domů
            </Link>
            <span className="mx-2">/</span>
            <Link href={MEDIKTOR.routes.marketing} className="hover:text-white">
              {MEDIKTOR.shortName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Ceník</span>
          </nav>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <MediktorMark
              size="lg"
              className="rounded-[22%] ring-2 ring-white/25 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)]"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">
                {p.eyebrow}
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {p.title}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-sky-100/95">{p.intro}</p>
              <p className="mt-2 text-sm text-sky-200/80">{p.trialNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {p.tiers.map((tier) => (
            <article
              key={tier.id}
              id={tier.id}
              className={`relative flex scroll-mt-24 flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                tier.highlighted
                  ? "border-[#005B96] ring-2 ring-[#005B96]/25"
                  : "border-[#cfe1f3]"
              }`}
            >
              {tier.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#005B96] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {tier.badge}
                </span>
              ) : null}
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
                {tier.audience}
              </p>
              <h2 className="mt-2 font-display text-xl font-bold text-[#021d33]">{tier.name}</h2>
              <p className="mt-3">
                <span className="text-3xl font-bold text-[#021d33]">{tier.priceLabel}</span>
                {tier.priceNote ? (
                  <span className="mt-1 block text-sm text-slate-500">{tier.priceNote}</span>
                ) : null}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{tier.description}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2">
                {tier.checkout ? (
                  <>
                    <V27CheckoutButton
                      kind="subscription"
                      productId={tier.checkout.monthlyProductId}
                      label={tier.checkout.monthlyLabel}
                    />
                    <V27CheckoutButton
                      kind="subscription"
                      productId={tier.checkout.annualProductId}
                      label={tier.checkout.annualLabel}
                      className="w-full border border-[#005B96]/30 bg-white text-[#005B96] hover:bg-[#005B96]/5"
                    />
                  </>
                ) : tier.contactHref ? (
                  <Button asChild className="w-full rounded-full bg-[#005B96]">
                    <Link href={tier.contactHref}>{tier.contactLabel}</Link>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl border border-[#cfe1f3] bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-[#021d33]">{p.bundleNote.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{p.bundleNote.body}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full border-[#cfe1f3]">
              <Link href={p.bundleNote.mediktorHref}>{p.bundleNote.mediktorLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#cfe1f3]">
              <Link href={p.bundleNote.physicianHref}>{p.bundleNote.physicianLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-[#021d33]">{p.comparison.title}</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#cfe1f3] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#d9e8f4] bg-[#f0f7ff]/60">
                <th className="px-4 py-3 font-semibold text-[#021d33]">Funkce</th>
                <th className="px-4 py-3 text-center font-semibold text-[#021d33]">Solo</th>
                <th className="px-4 py-3 text-center font-semibold text-[#021d33]">Ambulance</th>
                <th className="px-4 py-3 text-center font-semibold text-[#021d33]">Nemocnice</th>
              </tr>
            </thead>
            <tbody>
              {p.comparison.rows.map((row) => (
                <tr key={row.feature} className="border-b border-[#eef4fb] last:border-0">
                  <td className="px-4 py-3 text-slate-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center">
                    <ComparisonCell value={row.solo} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ComparisonCell value={row.practice} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ComparisonCell value={row.hospital} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#005B96]" />
              <h2 className="font-display text-2xl font-bold text-[#021d33]">Časté dotazy k cenám</h2>
            </div>
            <dl className="mt-6 space-y-4">
              {p.faq.map((item) => (
                <div key={item.q} className="rounded-2xl border border-[#d9e8f4] bg-white p-5">
                  <dt className="font-semibold text-[#021d33]">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <AppBrandVisual app={MEDIKTOR_APP} compact className="rounded-2xl ring-1 ring-[#cfe1f3]" />
        </div>
      </section>

      <section className="border-t border-[#d9e8f4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-lg font-bold text-[#021d33]">Právní upozornění</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{p.legal}</p>
          <p className="mt-2 text-xs text-slate-500">{formatLegalEntityLine(legalEntity)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full border-[#cfe1f3]">
              <Link href={MEDIKTOR.routes.marketing}>← Zpět na {MEDIKTOR.shortName}</Link>
            </Button>
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href={MEDIKTOR.routes.app}>Otevřít aplikaci</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
