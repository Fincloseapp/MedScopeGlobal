import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { OdbornaGate } from "@/components/odborna/odborna-gate";
import { ProfessionalDisclaimer } from "@/components/odborna/professional-disclaimer";
import { ClkVerifyForm } from "@/components/odborna/clk-verify-form";
import { getOdbornaAccess } from "@/lib/auth/odborna-access";
import { ODBORNA_SECTIONS } from "@/lib/config/odborna-sections";
import { logSecurityEvent } from "@/lib/security/security-log";

export const metadata: Metadata = {
  title: "Odborná sekce",
  description:
    "Obsah pro ověřené lékaře — klinické algoritmy, farmakoterapie a směrnice.",
};

export const dynamic = "force-dynamic";

export default async function OdbornaHubPage() {
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
    <ModulePageShell
      eyebrow="Odborná sekce"
      title="Obsah pro ověřené lékaře"
      description="Přístup úroveň 3 — vyžaduje ověření evidenčního čísla v registru České lékařské komory (ČLK)."
    >
      {!access.allowed ? (
        <OdbornaGate reason={access.reason!} clkStatus={access.clk} />
      ) : (
        <>
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Ověření ČLK aktivní
            {access.clk?.clkNumber ? ` · č. ${access.clk.clkNumber}` : ""}.
            Přístup je auditován.
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ODBORNA_SECTIONS.map((section) => (
              <FeatureCard
                key={section.slug}
                title={section.title}
                description={section.description}
                href={`/odborna/${section.slug}`}
              />
            ))}
          </div>

          <section className="mb-8 rounded-xl border bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-[#021d33]">
              Správa ověření
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Evidenční číslo můžete aktualizovat po změně registrace.
            </p>
            <div className="mt-4 max-w-md">
              <ClkVerifyForm
                initialStatus={access.clk?.status}
                clkNumber={access.clk?.clkNumber}
              />
            </div>
          </section>

          <ProfessionalDisclaimer className="mt-8" />

          <p className="mt-6 text-xs text-muted-foreground">
            Veřejný obsah:{" "}
            <Link href="/" className="text-primary hover:underline">
              domovská stránka
            </Link>
            {" · "}
            <Link href="/access-levels" className="text-primary hover:underline">
              úrovně přístupu
            </Link>
          </p>
        </>
      )}
    </ModulePageShell>
  );
}
