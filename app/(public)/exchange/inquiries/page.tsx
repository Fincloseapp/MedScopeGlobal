import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeInquiryReplyForm } from "@/components/exchange/inquiry-reply-form";
import { ExchangePlanSwitcher } from "@/components/exchange/plan-switcher";
import { listDemoInquiries } from "@/lib/exchange/inquiries";
import { entitlementsFor, parseExchangePlan } from "@/lib/exchange/monetization";
import { getAdvertiserContextFromCookies } from "@/lib/exchange/session";
import { regionLabel } from "@/lib/exchange/regions";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeSubCopy } from "@/lib/i18n/exchange-subscription-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import type { AvailabilityRegion } from "@/lib/exchange/regions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const sub = getExchangeSubCopy(locale);
  const meta = await buildLocalizedPageMetadata({
    title: sub.inquiriesTitle,
    description: sub.inquiriesLead,
    path: "/exchange/inquiries",
    locale,
  });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function ExchangeInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string; plan?: string; region?: string }>;
}) {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const sub = getExchangeSubCopy(locale);
  const params = await searchParams;
  const cookie = await getAdvertiserContextFromCookies();
  const plan = parseExchangePlan(params.as ?? params.plan ?? cookie.plan);
  const access = entitlementsFor(plan);
  let items = listDemoInquiries(plan);
  const region = params.region as AvailabilityRegion | undefined;
  if (region && access.canUseRegionalInbox) {
    items = items.filter((item) => !item.region || item.region === region || item.region === "Global");
  }

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={sub.inquiriesTitle} description={sub.inquiriesLead}>
      <ExchangePlanSwitcher locale={locale} current={plan} activateLabel={sub.activate} demoLabel={sub.demoPlan} />
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-[#021d33]">{item.listingTitle}</h2>
              {item.redacted ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                  {sub.anonymousBadge}
                </span>
              ) : null}
              {item.region ? (
                <span className="rounded-full border border-[#cfe1f3] px-2 py-0.5 text-xs">
                  {regionLabel(item.region, locale)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">{item.buyerOrganization}</p>
            {item.redacted ? (
              <p className="mt-2 text-sm text-slate-600">{item.message}</p>
            ) : (
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <p>
                  {item.buyerName} · {item.buyerEmail}
                  {item.buyerPhone ? ` · ${item.buyerPhone}` : ""}
                </p>
                <p>{item.message}</p>
              </div>
            )}
            <ExchangeInquiryReplyForm
              inquiryId={item.id}
              locale={locale}
              canReply={access.canReply && !item.redacted}
              replyCta={sub.replyCta}
              replyBlocked={sub.replyBlocked}
              upgradeCta={sub.upgradeCta}
            />
          </li>
        ))}
      </ul>
    </ModulePageShell>
  );
}
