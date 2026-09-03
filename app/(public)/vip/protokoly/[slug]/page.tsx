import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, BookmarkPlus, FileDown, ArrowLeft } from "lucide-react";
import {
  LONGEVITY_PROTOCOLS,
  getProtocol,
  localizedText,
} from "@/lib/ecosystem/longevity-protocols";
import { longevityProtocolJsonLd } from "@/lib/ecosystem/seo";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getVipProtocolsCopy,
  medicalDisclaimerFor,
} from "@/lib/i18n/vip-protocols-copy";

type Props = { params: Promise<{ slug: string }> };

function planLocale(record: Record<string, string[]>, locale: string): string {
  if (record[locale]?.length) return locale;
  if (record.en?.length) return "en";
  return "cs";
}

export async function generateStaticParams() {
  return LONGEVITY_PROTOCOLS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const protocol = getProtocol(slug);
  const locale = await getServerLocale();
  const copy = getVipProtocolsCopy(locale);
  if (!protocol) return { title: copy.protocolLabel };
  return buildPageMetadata({
    title: `${localizedText(protocol.title, locale)} | VIP Longevity`,
    description: localizedText(protocol.summary, locale),
    path: `/vip/protokoly/${slug}`,
    locale,
  });
}

export default async function ProtocolDetailPage({ params }: Props) {
  const { slug } = await params;
  const protocol = getProtocol(slug);
  if (!protocol) notFound();

  const locale = await getServerLocale();
  const copy = getVipProtocolsCopy(locale);
  const { isVip } = await getReaderContext();
  const locked = protocol.vipOnly && !isVip;

  const jsonLd = longevityProtocolJsonLd({
    title: localizedText(protocol.title, locale),
    description: localizedText(protocol.summary, locale),
    slug: protocol.slug,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href={localizePublicHref("/vip/protokoly", locale)}
          className="inline-flex items-center gap-1 text-sm text-[#005B96] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {copy.back}
        </Link>

        <header className="mt-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">
              {copy.protocolLabel} #{protocol.number.toString().padStart(2, "0")}
            </span>
            {protocol.vipOnly && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                <Crown className="h-3 w-3" /> {copy.vipBadge}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-[#021d33]">
            {localizedText(protocol.title, locale)}
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            {localizedText(protocol.subtitle, locale)}
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/app/mediflow?protocol=${protocol.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            <BookmarkPlus className="h-4 w-4" /> {copy.saveMediflow}
          </Link>
          {protocol.vipOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <FileDown className="h-4 w-4" /> {copy.exportPdf}
            </span>
          )}
        </div>

        <section className="prose prose-slate mt-8 max-w-none">
          <h2>{copy.summary}</h2>
          <p>{localizedText(protocol.summary, locale)}</p>

          {!locked ? (
            <>
              <h2>{copy.science}</h2>
              <p>{localizedText(protocol.scientificBasis, locale)}</p>
            </>
          ) : null}
        </section>

        {locked ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 text-center">
            <Crown className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-3 font-semibold text-[#021d33]">{copy.vipLockTitle}</p>
            <p className="mt-2 text-sm text-slate-600">{copy.vipLockBody}</p>
            <Link
              href={localizePublicHref("/predplatne?trial=1&plan=vip", locale)}
              className="mt-4 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
            >
              {copy.activateVip}
            </Link>
          </div>
        ) : (
          <ProtocolSections protocol={protocol} locale={locale} copy={copy} />
        )}

        <p className="mt-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {medicalDisclaimerFor(locale)}
        </p>
      </article>
    </>
  );
}

function ProtocolSections({
  protocol,
  locale,
  copy,
}: {
  protocol: NonNullable<ReturnType<typeof getProtocol>>;
  locale: string;
  copy: ReturnType<typeof getVipProtocolsCopy>;
}) {
  const dailyKey = planLocale(protocol.dailyPlan, locale);
  const weeklyKey = planLocale(protocol.weeklyPlan, locale);
  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.daily}</h2>
        <ul className="mt-3 space-y-2">
          {protocol.dailyPlan[dailyKey].map((step) => (
            <li key={step} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#005B96]" />
              {step}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.weekly}</h2>
        <ul className="mt-3 space-y-2">
          {protocol.weeklyPlan[weeklyKey].map((step) => (
            <li key={step} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {step}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.supplements}</h2>
        <div className="mt-3 space-y-3">
          {protocol.supplements.map((s) => (
            <div key={s.name} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-[#021d33]">{s.name}</p>
              <p className="text-sm text-slate-600">{s.dosage}</p>
              <p className="mt-1 text-xs text-slate-500">{localizedText(s.note, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.labs}</h2>
        <div className="mt-3 space-y-3">
          {protocol.labTests.map((t) => (
            <div key={t.name} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-semibold text-[#021d33]">{t.name}</p>
              <p className="text-sm text-slate-600">
                {copy.labFrequency}: {t.frequency}
              </p>
              <p className="mt-1 text-xs text-slate-500">{localizedText(t.note, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-[#021d33]">{copy.tools}</h2>
        <div className="mt-3 space-y-3">
          {protocol.tools.map((t) => (
            <div key={t.name} className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-semibold text-[#021d33]">{t.name}</p>
              <p className="text-sm text-slate-600">{localizedText(t.description, locale)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
