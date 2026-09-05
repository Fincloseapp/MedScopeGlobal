import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { OdbornaGate } from "@/components/odborna/odborna-gate";
import { ProfessionalDisclaimer } from "@/components/odborna/professional-disclaimer";
import { ClkVerifyForm } from "@/components/odborna/clk-verify-form";
import { getOdbornaAccess } from "@/lib/auth/odborna-access";
import { ODBORNA_SECTIONS } from "@/lib/config/odborna-sections";
import { getOdbornaHubCopy } from "@/lib/i18n/odborna-hub-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { logSecurityEvent } from "@/lib/security/security-log";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getOdbornaHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/odborna",
    locale,
  });
}

export const dynamic = "force-dynamic";

export default async function OdbornaHubPage() {
  const locale = await getServerLocale();
  const copy = getOdbornaHubCopy(locale);
  const access = await getOdbornaAccess();

  if (access.user && !access.allowed) {
    await logSecurityEvent({
      userId: access.user.id,
      action: "odborna:gate_view",
      status: "warning",
      details: { reason: access.reason },
    });
  }

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={copy.title} description={copy.lead}>
      <div className="mb-6 flex flex-wrap gap-2">
        {copy.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-[#005B96]/30 bg-[#005B96]/5 px-3 py-1 text-xs font-semibold text-[#005B96]"
          >
            {badge}
          </span>
        ))}
      </div>
      {!access.allowed ? (
        <OdbornaGate reason={access.reason!} clkStatus={access.clk} locale={locale} />
      ) : (
        <>
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {copy.verified}
            {access.clk?.clkNumber ? ` · ${access.clk.clkNumber}` : ""}. {copy.audited}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ODBORNA_SECTIONS.map((section) => (
              <FeatureCard
                key={section.slug}
                title={section.title}
                description={section.description}
                href={localizePublicHref(`/odborna/${section.slug}`, locale)}
              />
            ))}
          </div>

          <section className="mb-8 rounded-xl border bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-[#021d33]">{copy.manageTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.manageLead}</p>
            <div className="mt-4 max-w-md">
              <ClkVerifyForm
                initialStatus={access.clk?.status}
                clkNumber={access.clk?.clkNumber}
              />
            </div>
          </section>

          <ProfessionalDisclaimer className="mt-8" />

          <p className="mt-6 text-xs text-muted-foreground">
            {copy.publicLabel}{" "}
            <Link href={localizePublicHref("/", locale)} className="text-primary hover:underline">
              {copy.home}
            </Link>
            {" · "}
            <Link href={localizePublicHref("/access-levels", locale)} className="text-primary hover:underline">
              {copy.accessLevels}
            </Link>
          </p>
        </>
      )}
    </ModulePageShell>
  );
}
