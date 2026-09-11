import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangePlanSwitcher } from "@/components/exchange/plan-switcher";
import { listExchangeMailTemplates } from "@/lib/exchange/emails";
import { listDemoInquiries } from "@/lib/exchange/inquiries";
import { entitlementsFor, parseExchangePlan, planSpec } from "@/lib/exchange/monetization";
import { getAdvertiserContextFromCookies } from "@/lib/exchange/session";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeSubCopy } from "@/lib/i18n/exchange-subscription-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const sub = getExchangeSubCopy(locale);
  const meta = await buildLocalizedPageMetadata({
    title: sub.dashboardTitle,
    description: sub.dashboardLead,
    path: "/exchange/dashboard",
    locale,
  });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function ExchangeDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string; plan?: string }>;
}) {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const sub = getExchangeSubCopy(locale);
  const params = await searchParams;
  const cookie = await getAdvertiserContextFromCookies();
  const plan = parseExchangePlan(params.as ?? params.plan ?? cookie.plan);
  const access = entitlementsFor(plan);
  const spec = planSpec(plan);
  const inquiries = listDemoInquiries(plan);
  const mails = listExchangeMailTemplates(locale);
  const visibleContacts = inquiries.filter((item) => !item.redacted).length;

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={sub.dashboardTitle} description={sub.dashboardLead}>
      <ExchangePlanSwitcher locale={locale} current={plan} activateLabel={sub.activate} demoLabel={sub.demoPlan} />
      <p className="mt-4 text-sm text-slate-600">
        {copy.planBasic}/{copy.planPro}/{copy.planEnterprise}: <strong className="capitalize">{plan}</strong>
        {access.paid ? ` · ${sub.paid}` : ` · ${sub.free}`}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
          <h2 className="font-display text-lg font-semibold">{sub.inquiriesTitle}</h2>
          <p className="mt-2 text-3xl font-bold text-[#005B96]">{inquiries.length}</p>
          <p className="mt-1 text-sm text-slate-600">
            {access.canSeeContacts ? `${visibleContacts} contacts` : sub.anonymousBadge}
          </p>
          <Link href={localizePublicHref("/exchange/inquiries", locale)} className="mt-3 inline-block text-sm font-semibold text-[#005B96]">
            {sub.inquiriesTitle} →
          </Link>
        </article>
        <article className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
          <h2 className="font-display text-lg font-semibold">{sub.statsTitle}</h2>
          {access.canSeeStats ? (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>Featured slots: {spec.featuredSlots}</li>
              <li>Regional inbox: {access.canUseRegionalInbox ? "on" : "off"}</li>
              <li>Ad credits: {spec.adCredits}</li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">{sub.lockedBody}</p>
          )}
        </article>
        <article className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
          <h2 className="font-display text-lg font-semibold">{sub.micrositeTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{sub.micrositeLead}</p>
          {access.canUseMicrosite ? (
            <Link
              href={localizePublicHref("/exchange/m/pacific-lab-network", locale)}
              className="mt-3 inline-block text-sm font-semibold text-[#005B96]"
            >
              {sub.micrositeTitle} →
            </Link>
          ) : (
            <Link href={localizePublicHref("/exchange/pricing", locale)} className="mt-3 inline-block text-sm font-semibold text-[#005B96]">
              {sub.upgradeCta} →
            </Link>
          )}
        </article>
      </div>
      {!access.canSeeContacts ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-display text-lg font-semibold text-amber-950">{sub.lockedTitle}</h2>
          <p className="mt-2 text-sm text-amber-900">{sub.lockedBody}</p>
          <Link href={localizePublicHref("/exchange/pricing", locale)} className="mt-3 inline-block text-sm font-semibold text-[#005B96]">
            {sub.upgradeCta} →
          </Link>
        </section>
      ) : null}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">{sub.emailsTitle}</h2>
        <ul className="mt-4 space-y-3">
          {mails.map((mail) => (
            <li key={mail.kind} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">{mail.kind}</p>
              <p className="mt-1 font-semibold text-[#021d33]">{mail.subject}</p>
              <p className="mt-1 text-sm text-slate-600">{mail.preview}</p>
            </li>
          ))}
        </ul>
      </section>
    </ModulePageShell>
  );
}
